#! /bin/bash

directory="$HOME/app/backend"
cd $directory
if tmux has-session -t backend 2>/dev/null; then # restart backend if tmux session already exists
    tmux send-keys -t backend C-c
    tmux send-keys -t backend "npm run dev" C-m
else # otherwise create tmux session and start fresh backend instance
    tmux new-session -d -s backend
    tmux send-keys -t backend "npm run dev" C-m
    tmux detach-client
fi

