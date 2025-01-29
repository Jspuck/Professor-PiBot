# Professor PiBot

Professor PiBot is a discrete mathematics tutor application with a Flask backend and React frontend.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed Python 3.7+
* You have installed Node.js and npm.
* You have a Windows machine

## Installing Professor PiBot

To install Professor PiBot, follow these steps: 

Clone the repository:

Go to https://github.com/mikeclopton/Professor-PiBot

Click the green button <> Code dropdown and select "Open with GitHub Desktop"

Create the folder on your PC

Open in VSCode

Set up the backend:

Open a terminal

Make sure you are in Professor PiBot root folder

Terminal 1 (Backend Setup)

cd backend

python -m venv venv

venv/scripts/activate

pip install -r requirements.txt

python app.py

Terminal 2 (Frontend Setup)

cd frontend

npm install

npm run dev

--If you have an error regarding security, see these instructions:

* Press Windows + X and open Windows Powershell (Admin)

* Type Set-ExecutionPolicy RemoteSigned

* Confirm change by entering Y

* Go back to your original terminal and re-enter venv\Scripts\activate

## Using Professor PiBot

To use Professor PiBot, open a web browser and navigate to `http://localhost:5173/

## Contributing to Professor PiBot

To contribute to Professor PiBot, follow these steps:

Access the Repository:

Go to the GitHub repository page https://github.com/mikeclopton/Professor-PiBot

Ensure You're on the Latest Version:

On the repository page, make sure you're on the main branch (usually shown in a dropdown near the top-left).

Look for a message that says "This branch is up to date with main" to confirm you're seeing the latest version.

Clone the Code (Must have GitHub Desktop Installed):

- Open GitHub Desktop.
- Click **File** > **Clone Repository**.
- In the **URL** tab, paste the repository URL from GitHub.
- Select the local path where you'd like to clone the repository.
- Click **Clone**.
- Alternatively, you can click on the green "<> Code" button and click "Open With GitHub Desktop" to clone

### 2. Make Your Changes:
- Open the cloned repository's folder in your preferred code editor.
- Make the desired changes to the code.

### 3. Create a New Branch and Upload Changes:
- In GitHub Desktop, go to **Branch** > **New Branch**.
- Type in a new branch name (e.g., `feature-login-update` or `bugfix-database-connection`).
- Click **Create Branch**.
- After making your changes, return to GitHub Desktop.
- Review your changes in the **Changes** tab.
- Add a summary of your changes in the **Summary** box.
- Click **Commit to [your-branch-name]**.

### 4. Push Your Changes to GitHub:
- Once committed, click **Push origin** in GitHub Desktop to upload your changes to GitHub.

### 5. Create a Pull Request (Optional):
- After pushing, GitHub Desktop will show a notification with an option to create a pull request.
- Click **Create Pull Request** in GitHub Desktop or go to the repository's GitHub page.
- Add any necessary comments about your changes.
- Click **Create pull request** to submit your changes for review.



Important Notes:

Always create a new branch for your changes. Don't commit directly to the main branch.

Be descriptive in your commit messages and pull request descriptions.

If you're working on a specific issue, reference the issue number in your commit message or pull request (e.g., "Fixes #123").

Make sure you're only uploading files you've changed or added. Don't re-upload the entire project unless necessary.

If you're unsure about any steps, ask for help from Mike Clopton.

If you're unsure about any steps, ask for help from Mike Clopton.
