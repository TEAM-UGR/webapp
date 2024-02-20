packer {
  required_plugins {
    googlecompute = {
      source  = "github.com/hashicorp/googlecompute"
      version = ">= 1"
    }
  }
}



variable "gcp_project_id"{
    default = "development-414823"
}

variable "gcp_source_image_family"{
    default = "centos-stream-8"
}

variable "gcp_source_image_project_id"{
    default = "centos-cloud"
}

variable "gcp_zone"{
    default = "us-east1-b"
}

variable "gcp_ssh_username"{
    default = "packer"
}

source "googlecompute" "centos"{
    project_id = var.gcp_project_id
    source_image_family  = var.gcp_source_image_family
    source_image_project_id  = ["centos-cloud"]
    zone  = var.gcp_zone
    ssh_username = var.gcp_ssh_username
}

build {
    sources = [
        "source.googlecompute.centos"
    ]

    provisioner "file" {
    source = "demo.log"
    destination = "/tmp/demo.log"
  }
  provisioner "shell" {
    script = "mysql-node.sh"
  }
  provisioner "file" {
    source = "webapp-main.zip"
    destination = "/tmp/webapp-main.zip"
  }
  provisioner "shell" {
    script = "install-dependencies.sh"
  }

}

