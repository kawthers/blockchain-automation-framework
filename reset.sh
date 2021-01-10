#!/bin/bash
set -e

echo "Starting build process..."

echo "Adding env variables..."
export PATH=/root/bin:$PATH

#Path to k8s config file
KUBECONFIG=/home/max/blockchain-automation-framework/build/config


echo "Running the playbook..."
exec ansible-playbook -vv /home/max/blockchain-automation-framework/platforms/shared/configuration/site.yaml --inventory-file=/home/max/blockchain-automation-framework/platforms/shared/inventory/ -e "@/home/max/blockchain-automation-framework/build/network.yaml" -e 'ansible_python_interpreter=/usr/bin/python3' -e "reset='true'"
