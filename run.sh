#!/bin/bash
set -e

echo "Starting build process..."

echo "Adding env variables..."
export PATH=/root/bin:$PATH

#Path to k8s config file
KUBECONFIG=/home/baf/build/config


echo "Running the playbook..."
exec ansible-playbook -vv /home/baf/platforms/shared/configuration/site.yaml --inventory-file=/home/baf/platforms/shared/inventory/ -e "@/home/baf/build/network.yaml" -e 'ansible_python_interpreter=/usr/bin/python3'
