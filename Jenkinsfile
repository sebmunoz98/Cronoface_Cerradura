  pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/sebmunoz98/Cronoface_Cerradura.git'
            }
        }

        stage('Instalar PlatformIO') {
            steps {
                bat """
                pip install platformio
                """
            }
        }

        stage('Compilar ESP32 con PlatformIO') {
            steps {
                bat """
                pio run
                """
            }
        }
    }
}
