@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Windows
@REM Generated for CAHCET Placement System - Spring Boot 3.2
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET @@FAIL_MSG=ERROR: JAVA_HOME is not set and no 'java' command could be found in PATH.

@SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
@IF "%MAVEN_PROJECTBASEDIR%"=="" SET "MAVEN_PROJECTBASEDIR=%~dp0"
@IF "%MAVEN_PROJECTBASEDIR:~-1%"=="\" SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

@SET WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper
@SET WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
@SET WRAPPER_PROPERTIES=%WRAPPER_DIR%\maven-wrapper.properties

@SET DISTRIBUTION_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip
@FOR /F "usebackq tokens=1,2 delims==" %%a IN ("%WRAPPER_PROPERTIES%") DO (
  IF "%%a"=="distributionUrl" SET "DISTRIBUTION_URL=%%b"
)

@SET M2_HOME=%USERPROFILE%\.m2
@SET DIST_DIR=%M2_HOME%\wrapper\dists
@SET DISTRIBUTION_NAME=apache-maven-3.9.6
@SET DIST_PATH=%DIST_DIR%\%DISTRIBUTION_NAME%

@IF EXIST "%DIST_PATH%\bin\mvn.cmd" GOTO runMaven
@IF EXIST "%DIST_PATH%\bin\mvn" GOTO runMaven

@ECHO Downloading Maven %DISTRIBUTION_NAME%...
@IF NOT EXIST "%DIST_PATH%" MKDIR "%DIST_PATH%"

@SET TMPFILE=%DIST_PATH%\download.zip
@powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%DISTRIBUTION_URL%','%TMPFILE%')}"
@IF ERRORLEVEL 1 (
  @ECHO ERROR: Failed to download Maven. Please install Maven 3.9.x manually from https://maven.apache.org/
  @EXIT /B 1
)
@powershell -Command "& {Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('%TMPFILE%','%DIST_DIR%')}"
@DEL "%TMPFILE%"
@ECHO Maven downloaded successfully.

:runMaven
@SET MVN_CMD=%DIST_PATH%\bin\mvn.cmd
@IF NOT EXIST "%MVN_CMD%" SET "MVN_CMD=%DIST_PATH%\bin\mvn"
@IF NOT EXIST "%MVN_CMD%" (
  @ECHO ERROR: Maven binary not found at %DIST_PATH%\bin
  @ECHO Please install Maven 3.9.x from https://maven.apache.org/download.cgi
  @EXIT /B 1
)

@"%MVN_CMD%" %*
