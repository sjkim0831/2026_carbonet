pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
    choice(name: 'DEPLOY_TYPE', choices: ['PROJECT_RUNTIME', 'CARBONET_APP'], description: 'Deployment Type: Independent Project or Main Application')
    string(name: 'PROJECT_ID', defaultValue: 'p003', description: 'Target Project ID (only for PROJECT_RUNTIME)')
    string(name: 'BRANCH', defaultValue: 'main', description: 'Git branch to build')
    booleanParam(name: 'ENABLE_IDLE_SCALE', defaultValue: true, description: 'Scale out idle runtime when main runtime pressure is high')
    booleanParam(name: 'ENABLE_IDLE_DRAIN', defaultValue: false, description: 'Drain one idle runtime and unregister it from nginx')
    choice(name: 'DRAIN_IDLE_TARGET_IP', choices: ['', '34.82.132.175', '35.247.80.209'], description: 'Idle target IP to drain when ENABLE_IDLE_DRAIN is true')
  }
  environment {
    REPO_URL = 'https://github.com/sjkim0831/2026_carbonet.git'
    MAIN_TARGET = 'carbonet2026@136.117.100.221'
    MAIN_REMOTE_ROOT = '/opt/projects/carbonet'
  }

  stages {
    stage('Deploy') {
      steps {
        withCredentials([
          string(credentialsId: 'carbonet-github-token', variable: 'GITHUB_TOKEN'),
          string(credentialsId: 'carbonet-main-ssh-password', variable: 'MAIN_REMOTE_PASSWORD'),
          string(credentialsId: 'carbonet-idle-ssh-password', variable: 'IDLE_SSH_PASSWORD')
        ]) {
          sh '''
            set -euo pipefail
            GIT_CREDENTIALS_HEADER="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)"
            
            export BRANCH="$BRANCH"
            export REPO_URL="$REPO_URL"
            export MAIN_TARGET="$MAIN_TARGET"
            export MAIN_REMOTE_ROOT="$MAIN_REMOTE_ROOT"
            export MAIN_REMOTE_PASSWORD="$MAIN_REMOTE_PASSWORD"
            export MAIN_SSH_PASSWORD="$MAIN_REMOTE_PASSWORD"
            export IDLE_SSH_PASSWORD="$IDLE_SSH_PASSWORD"
            export IDLE_SCALE_ENABLED="$ENABLE_IDLE_SCALE"
            export IDLE_RESTORE_ENABLED="$ENABLE_IDLE_DRAIN"
            export DRAIN_IDLE_TARGET_IP="$DRAIN_IDLE_TARGET_IP"

            if [ "$DEPLOY_TYPE" == "PROJECT_RUNTIME" ]; then
              bash ops/scripts/jenkins-deploy-independent.sh "$PROJECT_ID"
            else
              bash ops/scripts/jenkins-deploy-carbonet.sh
            fi
          '''
        }
      }
    }
  }
}
