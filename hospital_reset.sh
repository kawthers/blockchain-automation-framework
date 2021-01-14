#!/bin/bash
set -e

echo "Starting build process..."

echo "Adding env variables..."
export PATH=/root/bin:$PATH

#Path to k8s config file
KUBECONFIG=/home/blockchain-automation-framework/build/config_hospital


echo "Running the playbook..."
exec ansible-playbook -vvvv /home/blockchain-automation-framework/platforms/shared/configuration/site.yaml --inventory-file=/home/blockchain-automation-framework/platforms/shared/inventory/ -e "@/home/blockchain-automation-framework/build/hospital.yaml" -e 'ansible_python_interpreter=/usr/bin/python3' -e "reset='true'"
