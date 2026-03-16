pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  triggers {
    pollSCM('H/1 * * * *')
  }

  stages {
    stage('Deploy Carbonet') {
      steps {
        sh '''#!/usr/bin/env bash
set -euo pipefail
bash /opt/util/jenkins/scripts/carbonet-pull-and-deploy.sh
'''
      }
    }
  }

  post {
    success {
      echo 'Carbonet auto-deploy completed.'
    }
    failure {
      echo 'Carbonet auto-deploy failed.'
    }
  }
}
