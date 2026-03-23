pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  parameters {
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
            GIT_CREDENTIALS_HEADER="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GITHUB_TOKEN" | base64 -w0)" \
            BRANCH="$BRANCH" \
            REPO_URL="$REPO_URL" \
            MAIN_TARGET="$MAIN_TARGET" \
            MAIN_REMOTE_ROOT="$MAIN_REMOTE_ROOT" \
            MAIN_REMOTE_PASSWORD="$MAIN_REMOTE_PASSWORD" \
            MAIN_SSH_PASSWORD="$MAIN_REMOTE_PASSWORD" \
            IDLE_SSH_PASSWORD="$IDLE_SSH_PASSWORD" \
            IDLE_SCALE_ENABLED="$ENABLE_IDLE_SCALE" \
            IDLE_RESTORE_ENABLED="$ENABLE_IDLE_DRAIN" \
            DRAIN_IDLE_TARGET_IP="$DRAIN_IDLE_TARGET_IP" \
            bash ops/scripts/jenkins-deploy-carbonet.sh
          '''
        }
      }
    }
  }
}
