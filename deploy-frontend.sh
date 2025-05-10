#! /bin/bash

directory="$HOME/app/frontend"
cd $directory
echo "Building static production files..."
npm run build
echo "Copying build files into /var/www/hayeslab/..."
sudo cp -r dist/* /var/www/hayeslab/
echo "Adding read permissions..."
sudo chmod -R 755 /var/www/hayeslab
sudo ln -s /etc/nginx/sites-available/hayeslab /etc/nginx/sites-enabled/
sudo nginx -t
echo "Restarting nginx server..."
sudo systemctl reload nginx
sudo systemctl restart nginx
echo "Nginx status:"
sudo systemctl status nginx



