@echo off

REM ===== 設定（ここだけ変更すればOK）=====
set FILENAME=ixDB_UPDATE.js
set DOWNLOAD_DIR=C:\Users\yoshi\Downloads
REM ===========================================

REM 元ファイル
set SRC=%DOWNLOAD_DIR%\%FILENAME%

REM 移動先（このbatがあるフォルダ）
set DEST=%~dp0%FILENAME%

move /Y "%SRC%" "%DEST%"

echo %FILENAME% を "%DEST%" に移動しました。