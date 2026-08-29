pipeline {
    agent any

    tools {
        nodejs 'NodeJS'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('SAST - Security Audit') {
            steps {
                sh 'npm audit --audit-level=high'
            }
        }

        stage('Lint & Quality') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Tests') {
            steps {
                sh 'npm test'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline do Jenkins executada com sucesso!'
        }
        failure {
            echo 'A pipeline do Jenkins falhou em algum estágio.'
        }
    }
}