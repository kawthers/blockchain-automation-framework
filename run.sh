#!/bin/bash
set -e

echo "Starting build process..."

echo "Adding env variables..."
export PATH=/root/bin:$PATH

#Path to k8s config file
KUBECONFIG=/home/maxible/baf/build/config


echo "Running the playbook..."
exec ansible-playbook -vv /home/maxible/baf/platforms/shared/configuration/site.yaml --inventory-file=/home/maxible/baf/platforms/shared/inventory/ -e "@/home/maxible/baf/build/network.yaml" -e 'ansible_python_interpreter=/usr/bin/python3'
