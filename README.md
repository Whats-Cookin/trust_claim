# OpenTrustClaims

## **Introduction**

Welcome to OpenTrustClaims! This guide will walk you through setting up the project on your local machine. We’ll cover everything from installing necessary tools to running the application.

## **Prerequisites**

Before you begin, ensure you have the following installed on your machine:

- **Git**: A version control system to manage the project’s source code.
- **Node.js**: A JavaScript runtime for running the application.
- **npm**: A package manager for JavaScript libraries and tools.
- **Yarn**: An alternative package manager (if needed).

## **Setting Up Git**

Git helps you manage changes to your code. To install Git:

**On Ubuntu/Linux:**
sudo apt update
sudo apt install git


**On macOS:**
brew install git


**On Windows:**
Download and install Git from [git-scm.com](https://git-scm.com/download/win).

Verify the installation:
git --version


## **Installing Node.js and npm**

Node.js allows you to run JavaScript on your machine, and npm is the package manager that comes with Node.js.

**On Ubuntu/Linux:**
sudo apt update
sudo apt install nodejs npm


**On macOS:**

**On Windows:**
Download and install Node.js from [nodejs.org](https://nodejs.org/), which includes npm.

Verify the installation:
node -v
npm -v


## **Cloning the Repository**

Clone the project’s repository to your local machine:
git clone https://github.com/Whats-Cookin/trust_claim.git
cd trust_claim


## **Installing Yarn**

Yarn is an alternative package manager. If the project uses Yarn, install it globally:

**On Ubuntu/Linux:**
sudo npm install -g yarn


**On macOS:**
brew install yarn


**On Windows:**
Download and install Yarn from [yarnpkg.com](https://yarnpkg.com/getting-started/install).

Verify the installation:
yarn --version


## **Installing Project Dependencies**

Install the necessary dependencies for the project using Yarn:
yarn install


If Yarn is not available, use npm:
npm install


## **Setting Up Environment Variables**

Create a `.env` file in the root directory of the project. This file contains configuration settings. Add the following content:

VITE_GITHUB_CLIENT_ID=[...] # Replace with your GitHub Client ID
VITE_BACKEND_BASE_URL=http://localhost:9000
VITE_CERAMIC_URL='http://13.56.165.66/'


For connecting to the live backend (if needed), update `.env`:

VITE_CERAMIC_URL='https://ceramic.linkedtrust.us/'
VITE_BACKEND_BASE_URL='https://live.linkedtrust.us'
VITE_DID_PRIVATE_KEY='...' # Refer to vault DID PK


## **Running the Development Server**

Start the development server using Yarn:
yarn dev


If Yarn is not available, use npm:
npm run dev


## **Accessing the Application**

Open your web browser and go to [http://localhost:3000](http://localhost:3000). You should see the application running locally.

## **Additional Information**

- **Database Setup:** Ensure that any required databases are set up and running. Apply any necessary migrations if needed.
- **CI/CD Integration:** For Jenkins CI/CD integration and deployment, refer to the [Deploying to Production](#deploying-to-production) section.

## **Deploying to Production**

To deploy the application to production:

1. SSH into the server:

ssh -l ubuntu -i [key] trustclaims.whatscookin.us


2. Navigate to the project directory and pull the latest changes:

cd /data/trust_claim
git pull


3. Install dependencies and build the project:
yarn && yarn build


4. Deploy the built application:

cd /data/trust_claim/dist
cp -r ./ /var/www/trust_claim/


This will deploy to [live.linkedtrust.us](https://live.linkedtrust.us).

## **Resources**

- **Use Cases:** See [Use Cases](https://docs.google.com/document/d/1iWRypT4aHS67MJhuCZj7e5gzcCr3HuKG0lO0g045ueY/edit) and related docs.
- **Dev Server:** Visit the dev version [linkedtrust Dev](https://dev.linkedtrust.us) for test data entry.
- **Jenkins CI/CD Integration:** Logs can be found on [Jenkins Last Build](http://68.183.144.184:8080/job/Trustclaim_frontend/lastBuild/).
- **Auth Details:** Access the CI/CD pipeline with credentials from the vault [Jenkins Logins](https://vault.whatscookin.us/app/passwords/view/63d7e1a5-0fab-45a6-b880-cd55530d7d1d).
- **Dev Server SSH Access:** SSH credentials are available in the vault [Dev Server SSH Creds](https://vault.whatscookin.us/app/passwords/view/cbe52954-3f7a-4e5d-9bb7-039389acc42c).
