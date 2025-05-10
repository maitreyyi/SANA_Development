#! /bin/bash

directory="$HOME/app/frontend"
cd $directory
exec npm run build
sudo cp -r dist/* /var/www/hayeslab/
sudo ln -s /etc/nginx/sites-available/hayeslab /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx
echo "Nginx status:"
sudo systemctl status nginx



