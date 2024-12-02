from flask import Flask, send_from_directory, request, jsonify, session, make_response
from flask_cors import CORS
from flask_session import Session
from supabase import create_client
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from dotenv import load_dotenv
from Tutor import solve_problem_with_validation, solve_problem_with_hint, solve_problem_with_full_answer
import requests
from sympy import parse_expr
import re

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend/dist')
CORS(app, supports_credentials=True, origins=["https://professorpibot.netlify.app"])


# Secret key for session management
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Supabase setup
supabase_url = os.getenv('SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_KEY')
supabase = create_client(supabase_url, supabase_key)

mathpix_url = os.getenv('MATHPIX_APP_ID')
mathpix_key = os.getenv('MATHPIX_API_KEY')

def normalize_math_expression(expr):
    """Normalize a mathematical expression for comparison"""
    try:
        # Remove whitespace and convert to lowercase
        expr = ''.join(expr.lower().split())
        
        # Replace common variants
        replacements = {
            '×': '*',
            '÷': '/',
            '−': '-',
            '=': '',  # Remove equals signs for comparison
            '{': '',
            '}': '',
            '\\': '',  # Remove LaTeX backslashes
        }
        
        for old, new in replacements.items():
            expr = expr.replace(old, new)
            
        return expr
    except Exception as e:
        print(f"Error normalizing expression: {str(e)}")
        return expr

def validate_mathematical_expressions(user_input, correct_answer, input_type='latex'):
    """
    Compare two mathematical expressions for equivalence, handling multiple formats
    """
    
    try:

         # For sequences, try sequence comparison first
        if ',' in user_input or ',' in correct_answer:
            user_nums = normalize_sequence(user_input)
            correct_nums = normalize_sequence(correct_answer)
            
            if len(user_nums) == len(correct_nums):
                return all(abs(u - c) < 0.0001 for u, c in zip(user_nums, correct_nums))
            
        # First normalize both inputs
        user_normalized = normalize_answer(user_input)
        correct_normalized = normalize_answer(correct_answer)
        
        # If they're exactly equal after normalization
        if user_normalized == correct_normalized:
            return True
            
        # For matrices
        if '\\begin{' in correct_answer or '[[' in correct_answer:
            return compare_matrices(user_normalized, correct_normalized)
            
        # For sequences/lists
        if '[' in correct_answer or '(' in correct_answer:
            return compare_sequences(user_normalized, correct_normalized)
            
        # For logical values
        if correct_answer.lower() in ['true', 'false']:
            return compare_logical_values(user_normalized, correct_normalized)
            
        # For numerical values
        try:
            user_float = float(user_normalized.replace(' ', ''))
            correct_float = float(correct_normalized.replace(' ', ''))
            return abs(user_float - correct_float) < 1e-6
        except ValueError:
            pass
            
        # For algebraic expressions
        try:
            return compare_algebraic_expressions(user_normalized, correct_normalized)
        except:
            pass

        return False

    except Exception as e:
        print(f"Validation error: {str(e)}")
        return False

def normalize_answer(answer):
    """Normalize answers for comparison"""
    if isinstance(answer, str):
        # Handle array format from MathPix
        answer = answer.replace('\\left[', '')
        answer = answer.replace('\\right]', '')
        answer = answer.replace('\\begin{array}{cc}', '')
        answer = answer.replace('\\end{array}', '')
        # Handle line breaks and separators
        answer = answer.replace('\\\\', ',')
        answer = answer.replace('&', ',')
        # Remove whitespace and newlines
        answer = ''.join(answer.split())
        
        # Extract only the numbers and separators
        numbers = []
        current_num = ''
        for char in answer:
            if char.isdigit() or char in '.-,':
                current_num += char
            elif current_num:
                numbers.append(current_num)
                current_num = ''
        if current_num:
            numbers.append(current_num)
            
        return ','.join(numbers)
    return answer

def compare_matrices(user_input, correct_answer):
    """
    Compare matrix representations
    """
    # Convert to standard format [[a,b],[c,d]]
    user_matrix = extract_matrix_values(user_input)
    correct_matrix = extract_matrix_values(correct_answer)
    return user_matrix == correct_matrix

def extract_matrix_values(matrix_str):
    """
    Extract numerical values from matrix string
    """
    try:
        print(f"Original matrix string: {matrix_str}")
        
        # First clean up the matrix string
        matrix_str = matrix_str.replace('\\left', '')
        matrix_str = matrix_str.replace('\\right', '')
        matrix_str = matrix_str.replace('\\begin{array}{cc}', '')
        matrix_str = matrix_str.replace('\\end{array}', '')
        matrix_str = matrix_str.replace('\\\\', ',')
        matrix_str = matrix_str.replace('&', ',')
        
        print(f"After cleanup: {matrix_str}")
        
        # Split and clean
        values = [val.strip() for val in matrix_str.split(',') if val.strip()]
        print(f"After split: {values}")
        
        # Convert to numbers
        numbers = [float(v) for v in values if v.replace('-', '').replace('.', '').isdigit()]
        print(f"Final numbers: {numbers}")
        
        return numbers
    except Exception as e:
        print(f"Error extracting matrix values: {str(e)}")
        return []

def normalize_sequence(seq_str):
    """
    Normalize sequence representation for comparison
    """
    try:
        # Remove all whitespace and brackets
        cleaned = seq_str.replace('[', '').replace(']', '').replace(' ', '')
        
        # Split into individual number strings
        parts = cleaned.split(',')
        
        # Convert each part to a decimal number
        numbers = []
        for part in parts:
            if '/' in part:
                num, den = map(float, part.split('/'))
                numbers.append(num/den)
            else:
                numbers.append(float(part))
                
        return numbers
    except:
        return []

def compare_sequences(user_input, correct_answer):
    """
    Compare sequence/list representations with flexible formatting
    """
    user_seq = normalize_sequence(user_input)
    correct_seq = normalize_sequence(correct_answer)
    
    # Check if lengths match
    if len(user_seq) != len(correct_seq):
        return False
        
    # Compare each number with small tolerance for floating point differences
    for u, c in zip(user_seq, correct_seq):
        if abs(u - c) > 1e-6:
            return False
            
    return True

def compare_logical_values(user_input, correct_answer):
    """
    Compare logical values
    """
    user_bool = user_input.strip() in ['1', 'true', 't']
    correct_bool = correct_answer.strip() in ['1', 'true', 't']
    return user_bool == correct_bool

def compare_algebraic_expressions(user_input, correct_answer):
    """
    Compare algebraic expressions
    """
    # Convert common variables
    user_input = user_input.replace('x', 'n')
    correct_answer = correct_answer.replace('x', 'n')
    
    # Try symbolic comparison using sympy
    try:
        from sympy import simplify, symbols
        n = symbols('n')
        user_expr = parse_expr(user_input)
        correct_expr = parse_expr(correct_answer)
        return simplify(user_expr - correct_expr) == 0
    except:
        # If symbolic comparison fails, try string comparison
        return user_input == correct_answer

# Serve the frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    print(f"Requested path: {path}")
    print(f"Static folder: {app.static_folder}")
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Register a new user
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Hash the password before storing it
        hashed_password = generate_password_hash(password)

        # Store the user in the 'users' table in Supabase
        response = supabase.table('users').insert({
            'username': username,
            'email': email,
            'password': hashed_password
        }).execute()

        return jsonify({'message': 'Registration successful'}), 201
    except Exception as e:
        print('Error during registration:', str(e))
        return jsonify({'error': 'An error occurred during registration'}), 500


# Login a user
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Fetch the user from Supabase
        result = supabase.table('users').select('*').eq('email', email).single().execute()
        user = result.data

        if user and check_password_hash(user['password'], password):
            # Save the user id in the session
            session['user_id'] = user['id']
            return jsonify({'message': 'Login successful', 'user_id': user['id']}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        print('Error during login:', str(e))
        return jsonify({'error': 'An error occurred during login'}), 500


# Get user info from the session (API for frontend to use)
@app.route('/api/user', methods=['GET'])
def get_user_info():
    user_id = session.get('user_id')

    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401

    try:
        # Fetch the user from Supabase
        user_result = supabase.table('users').select('id, username, email').eq('id', user_id).single().execute()
        user = user_result.data

        if user:
            # Fetch progress for the user
            progress_result = supabase.table('progress').select('module_id, progress, completion_status').eq('user_id', user_id).execute()
            progress_data = progress_result.data or []

            # Map progress data to include module names
            module_ids = [item['module_id'] for item in progress_data]
            modules_result = supabase.table('modules').select('id, module_name').in_('id', module_ids).execute()
            modules = {module['id']: module['module_name'] for module in modules_result.data or []}

            for item in progress_data:
                item['module_name'] = modules.get(item['module_id'], 'Unknown Module')
                item['completion_percentage'] = int(item['progress'] * 100)

            return jsonify({'user': user, 'progress': progress_data, 'user_id': user_id}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print('Error fetching user info:', str(e))
        return jsonify({'error': 'An error occurred'}), 500


# Logout user
@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)  # Remove the user from the session
    return jsonify({'message': 'Logout successful'}), 200



@app.route('/api/getmodule', methods=['GET'])
def get_module():
    module_number = request.args.get('module')
    try:
        # Construct the path to the module file
        module_path = os.path.join('modules', f'Module_{module_number}.json')
        
        print(f"Fetching module from: {module_path}")  # Debugging line

        # Open and load the module JSON file
        with open(module_path) as f:
            module_data = json.load(f)
            questions = module_data.get("modules", {}).get(module_number, {}).get("questions", [])
            title = module_data.get("modules", {}).get(module_number, {}).get("title", "Module")

            if not questions:
                return jsonify({'error': 'Module not found'}), 404
            
            # Return the module title and questions directly
            module_info = {
                'title': title,
                'questions': questions
            }
            return jsonify(module_info), 200
    except FileNotFoundError:
        print("File not found")  # Debugging line
        return jsonify({'error': 'Module not found'}), 404
    except Exception as e:
        print(f"Error loading module: {e}")  # Debugging line
        return jsonify({'error': 'An error occurred while loading the module'}), 500




@app.route('/api/get_tutor_response', methods=['GET'])
def get_tutor_response():
    module = request.args.get('module')
    part = request.args.get('part')

    print(f"Received Module: {module}, Part: {part}")  # Debugging line

    try:
        file_path = f'modules/Module_{module}.json'
        print(f"Attempting to open: {file_path}")  # Debugging line
        with open(file_path) as f:
            data = json.load(f)
            
            # Access the module and part dynamically to get questions
            questions = data.get("modules", {}).get(module, {}).get("parts", {}).get(part, {}).get("questions", [])

            if not questions:
                return jsonify({'error': 'Module or part not found'}), 404
            
            # Return the entire part information for navigation
            part_info = {
                'title': data['modules'][module]['title'],
                'questions': questions
            }
            return jsonify(part_info), 200
    except FileNotFoundError:
        return jsonify({'error': 'Module or part not found'}), 404


@app.route('/api/process', methods=['POST'])
def process_input():
    data = request.json
    user_input = data.get('input', '')
    submission_type = data.get('submissionType', '')
    context = data.get('context', {})

    if submission_type == 'chat':
        message_type = context.get('messageType', 'regular')
        hint_number = context.get('hintNumber', 1)
        previous_messages = context.get('previousMessages', [])
        
        if message_type == 'hint':
            # Include conversation history in hint generation
            solution = solve_problem_with_hint(user_input, hint_number, previous_messages)
            return jsonify({
                'response': solution,
                'type': message_type
            })
        else:
            # Include conversation history in full answer generation
            solution = solve_problem_with_full_answer(user_input, previous_messages)
            return jsonify({
                'response': solution,
                'type': message_type
            })
    
    if submission_type == 'validation':
        correct_answer = data.get('correctAnswer', '')
        input_type = data.get('inputType', 'latex')
        
        # Simple direct comparison first
        if str(user_input).strip() == str(correct_answer).strip():
            return jsonify({'isCorrect': True})
            
        # If not exact match, try validation through formula comparison
        is_correct = validate_mathematical_expressions(user_input, correct_answer, input_type)
        return jsonify({'isCorrect': is_correct})

    try:
        # Store input in Supabase for record-keeping
        response = supabase.table('inputs').insert({
            'text': user_input,
            'type': submission_type
        }).execute()
        print("Input stored in Supabase:", response)
    except Exception as e:
        print("Error storing input in Supabase:", str(e))
    
    # Process the input using the validator
    solution = solve_problem_with_validation(user_input)

    return jsonify({'response': solution})


@app.route('/api/update_user_info', methods=['PUT'])
def update_user_info():
    user_id = session.get('user_id')
    data = request.json

    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401

    username = data.get('username')
    email = data.get('email')

    if not username or not email:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Update the user in the 'users' table in Supabase
        response = supabase.table('users').update({
            'username': username,
            'email': email
        }).eq('id', user_id).execute()

        return jsonify({'message': 'User info updated successfully'}), 200
    except Exception as e:
        print('Error updating user info:', str(e))
        return jsonify({'error': 'An error occurred during update'}), 500


@app.route('/api/process-drawing', methods=['POST'])
def process_drawing_endpoint():
    data = request.get_json()
    print(f"Received data: {data}")  # Debugging line
    image_src = data.get('src')
    formats = data.get('formats', [])
    data_options = data.get('data_options', {})

    try:
        # Call to MathPix API
        mathpix_response = requests.post('https://api.mathpix.com/v3/text', json={
            'src': image_src,
            'formats': formats,
            'data_options': data_options
        }, headers={
            'Content-Type': 'application/json',
            'app_id': mathpix_url,
            'app_key': mathpix_key
        })
        
        print(f"MathPix response: {mathpix_response.text}")  # Debugging line
        
        if mathpix_response.status_code == 200:
            return jsonify(mathpix_response.json())
        else:
            return jsonify({'error': 'Failed to process drawing', 'status_code': mathpix_response.status_code}), 500
    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debugging line
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/update-progress', methods=['POST'])
def update_progress():
    data = request.json
    user_id = data.get('user_id')
    module_id = data.get('module_id')
    progress = data.get('progress')  # This will be a decimal (e.g., 0.75 for 75%)

    if not all([user_id, module_id, progress is not None]):
        return jsonify({'error': 'Missing required data'}), 400

    try:
        # Check if progress record exists
        result = supabase.table('progress').select('*')\
            .eq('user_id', user_id)\
            .eq('module_id', module_id)\
            .execute()
        
        existing_progress = result.data

        if existing_progress:
            # Only update if new progress is higher than existing progress
            if progress > existing_progress[0]['progress']:
                supabase.table('progress').update({
                    'progress': progress,
                    'completion_status': progress >= 1.0  # Mark as complete if 100%
                }).eq('user_id', user_id)\
                  .eq('module_id', module_id)\
                  .execute()
        else:
            # Create new progress record
            supabase.table('progress').insert({
                'user_id': user_id,
                'module_id': module_id,
                'progress': progress,
                'completion_status': progress >= 1.0
            }).execute()

        return jsonify({'message': 'Progress updated successfully'}), 200
    except Exception as e:
        print(f"Error updating progress: {str(e)}")
        return jsonify({'error': 'An error occurred while updating progress'}), 500



# Run the Flask app
if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
