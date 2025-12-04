pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: agent
spec:
  serviceAccountName: jenkins
  containers:
  - name: node
    image: node:18-alpine
    command:
    - cat
    tty: true
  - name: docker
    image: docker:dind
    command:
    - cat
    tty: true
    securityContext:
      privileged: true
    volumeMounts:
      - name: dind-storage
        mountPath: /var/lib/docker
  - name: trivy
    image: aquasec/trivy:latest
    command:
    - cat
    tty: true
  - name: helm
    image: alpine/helm:latest
    command:
    - cat
    tty: true
  - name: aws
    image: amazon/aws-cli:latest
    command:
    - cat
    tty: true
  volumes:
    - name: dind-storage
      emptyDir: {}
'''
        }
    }

    environment {
        // App Config
        APP_NAME = 'frontend'
        AWS_REGION = 'us-east-1'
        ECR_REGISTRY = '044302809167.dkr.ecr.us-east-1.amazonaws.com'
        IMAGE_URI = "${ECR_REGISTRY}/ticket-booking/${APP_NAME}"
        
        // SonarQube Config
        SONAR_HOST_URL = 'https://sonarcloud.io'
        SONAR_ORG = 'test-booking-application'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.DOCKER_TAG = "${BUILD_NUMBER}-${env.GIT_COMMIT}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                container('node') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint & Test') {
            steps {
                container('node') {
                    sh 'npm run lint'
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('node') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh 'apk add --no-cache openjdk17-jre'
                        sh """
                            npx sonar-scanner \
                            -Dsonar.projectKey=${SONAR_ORG}_${APP_NAME} \
                            -Dsonar.organization=${SONAR_ORG} \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('docker') {
                    script {
                        sh '''
                            dockerd-entrypoint.sh &
                            sleep 10
                            while ! docker info > /dev/null 2>&1; do
                                echo "Waiting for Docker daemon to start..."
                                sleep 2
                            done
                            echo "Docker daemon is ready"
                        '''
                        sh "docker build -t ${IMAGE_URI}:${DOCKER_TAG} ."
                        sh "docker tag ${IMAGE_URI}:${DOCKER_TAG} ${IMAGE_URI}:latest"
                    }
                }
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                container('docker') {
                    script {
                        sh '''
                            apk add --no-cache wget tar
                            wget -q https://github.com/aquasecurity/trivy/releases/download/v0.48.0/trivy_0.48.0_Linux-64bit.tar.gz
                            tar zxf trivy_0.48.0_Linux-64bit.tar.gz
                            mv trivy /usr/local/bin/
                            chmod +x /usr/local/bin/trivy
                        '''
                        
                        sh "docker save ${IMAGE_URI}:${DOCKER_TAG} -o /tmp/image.tar"
                        sh "trivy image --input /tmp/image.tar --severity CRITICAL --exit-code 1 --no-progress"
                        sh "trivy image --input /tmp/image.tar --severity HIGH,CRITICAL --no-progress > trivy-report.txt"
                        sh "rm /tmp/image.tar"
                    }
                }
            }
        }

        stage('Push to ECR') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: 'aws-ecr-creds', passwordVariable: 'ECR_PASSWORD', usernameVariable: 'ECR_USERNAME')]) {
                        script {
                            sh '''
                                apk add --no-cache python3 py3-pip
                                pip3 install --break-system-packages awscli
                            '''
                            
                            sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}"
                            sh "docker push ${IMAGE_URI}:${DOCKER_TAG}"
                            
                            if (env.BRANCH_NAME == 'main') {
                                echo "🚀 Pushing 'latest' tag for main branch"
                                sh "docker push ${IMAGE_URI}:latest"
                            } else {
                                echo "⚠️ Skipping 'latest' tag push for branch: ${env.BRANCH_NAME}"
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
        }
        success {
            echo "✅ CI Pipeline succeeded! Built and pushed ${APP_NAME}:${DOCKER_TAG}"
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo "🔄 Updating image tag in Git for ArgoCD..."
                    
                    withCredentials([usernamePassword(credentialsId: 'github-token', passwordVariable: 'GH_TOKEN', usernameVariable: 'GH_USER')]) {
                        sh """
                            set -e
                            
                            echo "=== Current directory ==="
                            pwd
                            ls -la
                            
                            echo "=== Checking if charts/${APP_NAME} exists ==="
                            if [ ! -d "charts/${APP_NAME}" ]; then
                                echo "ERROR: charts/${APP_NAME} directory not found!"
                                exit 1
                            fi
                            
                            cd charts/${APP_NAME}
                            
                            echo "=== Git status before changes ==="
                            git status
                            
                            echo "=== Fetching latest from origin ==="
                            git fetch origin main
                            
                            echo "=== Switching to main branch ==="
                            git checkout -B main origin/main
                            
                            echo "=== Current values.yaml tag ==="
                            grep "tag:" values.yaml || echo "No tag found"
                            
                            echo "=== Updating image tag to ${DOCKER_TAG} ==="
                            sed -i 's/tag: .*/tag: ${DOCKER_TAG}/' values.yaml
                            
                            echo "=== New values.yaml tag ==="
                            grep "tag:" values.yaml
                            
                            echo "=== Configuring git ==="
                            git config user.email "jenkins@ci.local"
                            git config user.name "Jenkins CI"
                            
                            echo "=== Adding changes ==="
                            git add values.yaml
                            
                            echo "=== Git diff ==="
                            git diff --cached
                            
                            echo "=== Committing changes ==="
                            if git diff --cached --quiet; then
                                echo "No changes to commit"
                            else
                                git commit -m "chore: Update ${APP_NAME} image to ${DOCKER_TAG}"
                                
                                echo "=== Pushing to GitHub ==="
                                git push https://${GH_USER}:${GH_TOKEN}@github.com/test-booking-application/${APP_NAME}.git HEAD:main
                                
                                echo "✅ Successfully pushed changes to GitHub"
                            fi
                        """
                    }
                    
                    echo "✅ Image tag updated in Git. ArgoCD will deploy automatically."
                }
            }
        }
        failure {
            echo "❌ CI Pipeline failed."
        }
    }
}
