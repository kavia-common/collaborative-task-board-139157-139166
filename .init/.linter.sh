#!/bin/bash
cd /home/kavia/workspace/code-generation/collaborative-task-board-139157-139166/taskboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

