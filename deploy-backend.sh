#! /bin/bash

directory="~/app/backend"
cd $directory
if tmux has-session -t backend 2>/dev/null; then
    tmux attach-session -t backend
    tmux send-keys -t backend C-c
    tmux send-keys -t backend "npm run dev" C-m
    tmux detach-client
else
    tmux new-session -d -s backend
    tmux send-keys -t backend "npm run dev" C-m
    tmux detach-client
fi

