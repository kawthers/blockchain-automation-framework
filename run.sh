#!/bin/bash
set -e

echo "Starting build process..."

echo "Adding env variables..."
export PATH=/root/bin:$PATH

#Path to k8s config file
KUBECONFIG=/project/baf/build/config


echo "Running the playbook..."
exec ansible-playbook -vv /project/baf/platforms/shared/configuration/site.yaml --inventory-file=/project/baf/platforms/shared/inventory/ -e "@/project/baf/build/network.yaml" -e 'ansible_python_interpreter=/usr/bin/python3'
