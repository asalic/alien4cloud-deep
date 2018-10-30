# Alien4Cloud DEEP Docker

[![GitHub license](https://img.shields.io/github/license/indigo-dc/alien4cloud-deep.svg?maxAge=2592000&style=flat-square)](https://github.com/indigo-dc/alien4cloud-deep/blob/master/LICENSE)
![Repo size](https://img.shields.io/github/repo-size/indigo-dc/alien4cloud-deep.svg?maxAge=2592000&style=flat-square)



This repository contains the necessary parts needed to create a Docker image holding the Alien4cloud application, along with the DEEP - Indigo Data Cloud TOSCA types, and the plugin which connects Alien4Cloud (A4C) to the orchestrator used in DEEP.
Each time the Docker image is created, the latest version of the normative TOSCA used by IndigoDataCloud and the latest version of the plugin are integrated in this image.

## Getting Started

Right now, we use a customized version of A4C 2.0.
The code for our version is in the *a4c* directory in the root of this repository.
The plugin code is in the *indigodc-orchestrator-plugin* directory.

The default port for A4C is 8088.

The default username / password are *admin*/*admin*. Please change them!

## Prerequisites

Aside of the official requirements found at http://alien4cloud.github.io/#/documentation/2.0.0/getting_started/new_getting_started.html, Alien4Cloud needs at least 3GB of RAM to run and a dual core CPU.

You also need Docker, we tested with the CE version 17.03 and above. We strongly advise you to install the latest version from the official https://docs.docker.com/install/ site.

## Docker Arguments

We defined a number of constants to allow easy parametrisation of the container.

* **user_uid** - the UID of the non-priviledged user that runs the A4C server
* **user_gid** - the group UID of the non-priviledged user that runs the A4C server
* **a4c_ver** - the version of A4C used in the container, e.g. *2.0.0* or *2.1.0-SNAPSHOT*; This is the official version, released by the original developers
* **a4c_install_path** - the path to the instalation root directory of A4C
* **a4c_src_dir** - the relative path used to store the source of A4C
* **a4c_install_dir** - the relative path denoting the root where the A4C war is stored
* **a4c_upv_ver** - the version of A4C modified and released by us; It uses the **a4c_ver** as prefix to which an suffix is added, e.g. *-UPV-1.0.0*
* **a4c_user** - the user name of the non-priviledged user that executes the A4C server 

## Docker Variables

The docker file contains environment variables.
Some of them can be modified by the user when running a container.
These are denoted by RW (read-write). 
The other group exists just to indicate features that were builtin in the container.
This group is marked with RO (read-only).
The RO group can be modified by modifying the args detailed in the previous paragraph.
If the name of a variable is the same as the name of an argument, but with capital letters, then the variable is initialized with the valued of the argument.

* **A4C_PORT_HTTP** (RO) - the port on which A4C is exposed
* **A4C_PORT_HTTPS** (RO) - the port on which A4C is exposed
* **A4C_INSTALL_PATH** (RO) - the path to the instalation root directory of A4C
* **A4C_SRC_DIR** (RO) - the relative path used to store the source of A4C
* **A4C_INSTALL_DIR** (RO) - the relative path denoting the root where the A4C war is stored
* **A4C_USER** (RO) - the user name of the non-priviledged user that executes the A4C server 

* **A4C_RUNTIME_DIR** (RW) - the container directory that holds the runtime data generated by A4C during runtime  like logs, uploads, and the Elastic Search cluster data
* **A4C_RESET_CONFIG**  (RW) - Caution! Enable the A4C settings manager execution with old data present; This will delete everything from the directory set in the **A4C_RUNTIME_DIR** and will let the settings manager re-create the A4C config files; Either "true" or "false"; Disabled for the time being
* **A4C_ADMIN_USERNAME** (RW) - the username of the default admin user of A4C
* **A4C_ADMIN_PASSWORD** (RW) - the password of the default admin user of A4C
* **A4C_ENABLE_SSL** (RW) - enable SSL mode for A4C; HTTP will be disabled; Either "true" or "false" 
* **A4C_KEY_STORE_PASSWORD** (RW) - the password of the keystore used by A4C
* **A4C_KEY_PASSWORD** (RW) - the password of the key that is added using the PEM file refered by the ENV **A4C_PEM_CA_KEY_FILE** 
* **A4C_PEM_CA_CERT_FILE** (RW) - the name of the PEM file with the certificate used to secure the A4C instance (just the name, without path)
* **A4C_PEM_CA_KEY_FILE** (RW) - the name of the PEM file with the key used to secure the A4C instance (just the name, without path)
* **A4C_CERTS_ROOT_PATH** (RW) - the full path to the directory containing the files refered by **A4C_PEM_CA_CERT_FILE** and **A4C_PEM_CA_KEY_FILE**, respectively

## Security

Skip this section if you don't want to deploy a secured A4C instance.

If you want to activate the HTTPS protocol for the A4C instance, you must set the **A4C_ENABLE_SSL** ENV to "true", without double quotes. Furthermore, you must mount an external volume containing a ca pem certificate (with the file name controlled by the **A4C_PEM_CA_CERT_FILE** ENV) and a ca pem key (with the file name controlled by the **A4C_PEM_CA_KEY_FILE** ENV). Finally, since the previous two files must be just file names, you can control the path inside the container for the mount using the **A4C_CERTS_ROOT_PATH** ENV. You can control the Java keystore password by the means of the **A4C_KEY_STORE_PASSWORD** ENV, and set the password for your key using the **A4C_KEY_PASSWORD** ENV. Take a look at the examples in the _Deployment_ section.

## Deployment

You can get the docker image from [DockerHub IndigoDC repo](https://hub.docker.com/r/indigodatacloud/alien4cloud-deep/).


* Get the Docker container by running:

```
docker pull indigodatacloud/alien4cloud-deep
```

* Create the deployment using:

```
docker run -d --name alien4cloud-deep  -p ${A4C_PORT_HTTP}:${A4C_PORT_HTTP} indigodatacloud/alien4cloud-deep
```

where ${A4C_PORT} is explained in the *Docker Variables* section of this README.

* Follow the logs (and wait for the web app to start up):

```
docker logs -f alien4cloud-deep
```

* You can also mount the directory containing the runtime data generated by A4C, e.g.:

```
docker run -d --name alien4cloud-deep  -p ${A4C_PORT_HTTP}:${A4C_PORT_HTTP} -e A4C_RUNTIME_DIR=${A4C_RUNTIME_DIR_MINE} -v /mnt/a4c_runtime:${A4C_RUNTIME_DIR_MINE} indigodatacloud/alien4cloud-deep
```

where ${A4C_VOLUME_DIR} & ${A4C_PORT} are explained in the *Docker Variables* section of this README.

* In order to secure the A4C connection you can use the following:

```
docker run -d --name alien4cloud-deep  -p ${A4C_PORT_HTTPS}:${A4C_PORT_HTTPS} -e A4C_RUNTIME_DIR=${A4C_RUNTIME_DIR_MINE} -v <path to directory that will hold A4C's runtime data>:${A4C_RUNTIME_DIR_MINE} -e A4C_CERTS_ROOT_PATH=${A4C_CERTS_ROOT_PATH_MINE} -v <path to certificates root>:${A4C_CERTS_ROOT_PATH_MINE} -e A4C_PEM_CA_CERT_FILE=<ca cert file name> -e A4C_PEM_CA_KEY_FILE=<ca private key file name> -e A4C_KEY_PASSWORD=<password used to sign the certificate> -e A4C_ENABLE_SSL=true indigodatacloud/alien4cloud-deep
```

where you have to specify the secure port, the root path where the certificates are on the host and its mapping inside the container, the names of the key and certificates pems and to enable SSL


## Usage

Once Alien4Cloud started, you can connect to it using a [supported browser](https://alien4cloud.github.io/#/documentation/2.0.0/admin_guide/supported_platforms.html).
Before anything else, one should take a look at the [Alien4Cloud documentation](https://alien4cloud.github.io/#/documentation/2.0.0/).

### Plugin activation

The IndigoDataCloud Orchestrator plugin comes preinstalled in the Docker container. It should also be activated by default. Please check the list from **Administration** -> **Plugins**. The switch on the right should be green.

### Instance Creation

First and foremost, one should create and instance of the DEEP - IndigoDataCloud Orchestrator plugin.
Next, the values for the parameters should be set (explanation for each in the *Plugin Parameters* subsection.
Finally, on the same page, one has to create a location.
We support only one location, that is *Deep Orchestrator Location*.

### Users

For the moment, the plugin uses the username and password utilized during the A4C login.
As a result, once you have A4C up and running, please create a new user having the same username and password as in IAM.
A user can be added using the  **Administration** -> **Users** -> **New User** functionality.
The web application stores the information locally.
If you change it in the IAM, you have to manually update it for each A4C instance.

The A4C user roles are not taken in consideration by the plugin.
The admin should consider the proper role(s) for a user only in the context of the A4C running instance.

### Plugin Parameters

<!---* **user** - The user used to obtain the authorization token to deploy topologies on the DEEP orchestrator. One can register on the page defined by the **iamHost** variable.
* **password** - The password used in conjuction with **user** to obtain the authorization token to deploy topologies on the DEEP orchestrator. One can register on the page defined by the **iamHost** variable.-->
* **clientId** - Once one has an account on the **iamHost**, an application can be registered. After registration, the IAM server generates a unique pair of a **clientId** and a **clientSecret** that is needed to get a token.
* **clientSecret** - Once one has an account on the **iamHost**, an application can be registered. After registration, the IAM server generates a unique pair of a **clientId** and a **clientSecret** that is needed to get a token.
* **tokenEndpoint** - Once one has a **clientId** and a **clientSecret**, a token can be obtained using the endpoint defined by this variable.
* **tokenEndpointCert** - The certificate used by the **tokenEndpoint**, if the server uses an encrypted connection (HTTPS). Take a look at *Obtain Certificate* subsection to learn how to obtain the certificate.
* **clientScopes** - When calling the token generator endpoint, one has to supply a list of scopes for the token. This list has the elements separated by a space e.g. *openid profile email offline_access*
* **orchestratorEndpoint** - The endpoint of the orchestrator used to deploy the topologies.
* **orchestratorEndpointCert** - The certificate of the **orchestratorEndpoint** server. Take a look at *Obtain Certificate* subsection to learn how to obtain the certificate.
* **iamHost** - The host that allows one to register an account, and get the **clientId** and the **clientSecret**.
* **iamHostCert** - The certificate of the **iamHost** server. Take a look at *Obtain Certificate* subsection to learn how to obtain the certificate.
* **orchestratorPollInterval** - Alien4Cloud tries to obtain the history of events every number of seconds. This parameter sets that number.
* **importIndigoCustomTypes** - Depending on the status of the work, there can be a different location of the indigo types definition file that is sent to the orchestrator. This field allows the admin to specify which TOSCA types file is used for all deployments that go through the IndigoDCOrchestrator plugin. Please keep in mind that this field affects only the future deployments. This happens because it is read when a topology is deployed.

#### Obtain Certificate

In order to obtain the certificates used by the plugin and stored in the **tokenEndpointCert**, **orchestratorEndpointCert**, and **iamHostCert** respectively, you should follow the steps described in this subsection for each different server. 
We refer to servers as in the following unit: _*.domain.extension_.
Two variables may point towards the same server, but with different paths.
_deep-paas.cloud.ba.infn.it/rest/v1_ and _deep-paas.cloud.ba.infn.it/token_ point towards the same domain/subdomains with different paths, therefore you only have to execute the following procedure once, for _deep-paas.cloud.ba.infn.it_.
You also need the port (normally 443 for HTTPS), as you'll see next.


1. Install openssl

```
apt-get install openssl
```

2. Get the key from the server (example for the development server managing the orchestrator).
Use echo to terminate the connection

```
echo "Q" | openssl s_client -showcerts -servername deep-paas.cloud.ba.infn.it -connect deep-paas.cloud.ba.infn.it:443 > crt.tmp
```

3. Copy a certificate from *crt.tmp*.
This file may contain more than one, any is valid.
You need the characters between *-----BEGIN CERTIFICATE-----* and *-----END CERTIFICATE-----*, for example to get all certificates separated by new lines:

```
grep -m 1 -ozP '(?<=-----BEGIN\ CERTIFICATE-----)(\n|.)+?(?=-----END\ CERTIFICATE-----)' crt.tmp > crt_solos.tmp
```

4. Remove the new lines from one certificate with your prefered approach, e.g.:

```
cat crt_solos.tmp | tr -d '\n'
```

5. This BASE64 string can now be used with the app


### Launching a Topology (Fast Lane)

Once you have logged in, go to the **Applications** tab.
Open the *New application* window by clicking the button with the same name.
Give a name to your app and, optionally, a description.
A4C automatically generates the *Archive Id*.
After you press the *Create* button, a new screen with the application details greets you.
In the *Work on an environment* paragraph, you can click on the element on the row of the table listing all the environments.
A screen with the steps to follow to launch your topology should be displayed to you.
The **Topology** step should be selected, and an *Edit* button available.
You shouldn't be able to navigate further until you create a topology, and it is valid.
Once you do that, you can set the inputs, then select the location created as specified earlier in this chapter and finally deploy your application.
The **Matching** step should run without any problems, as we support all nodes from TOSCA standard and IndigoDataCloud.
Once you launched your topology, you have to wait until it is deployed.
Please refresh your browser if nothing happens for a while.
The **Manage current deployment** tab contains the details about your deployment.
We currently do not support showing information about individual nodes of the deployment.

## Testing

We implemented a series of tests that should be executed during the maven building step.
You can find them in the **indigodc-orchestrator-plugin/src/test/** directory.

You can run the unit tests by calling _mvn_ with a specific target:

```
mvn clean test
```

### Coverage

During the plugin building process, we use Jacoco (through the Eclipse plugin for fast coverage execution, or Maven for automatic release).
Jacoco generates the _jacoco-deep.exec_ file in the target/coverage-reports/ directory, after running the maven **test** lifecycle. 

If you want to visualize the results in a human friendly format, you can convert the _jacoco-deep.exec_ file to html using the CLI from the package at https://www.eclemma.org/jacoco/, e.g.

```
java -jar jacoco/lib/jacococli.jar report target/coverage-reports/jacoco-deep.exec --classfiles target/classes/ --html plugin-html-coverage-report/
```

We require a minimum of 70% overall coverage by unit tests. When the plugin is built, Maven checks if the minimum threshold has been achieved or exceeded. If it hasn't, then the whole process has failed.

### Style

The A4C orchestrator plugin's Java code must respect the Google Java formatting style, on [Github](https://github.com/google/google-java-format).

We use checkstyle with Maven, as a plugin. This way we can rest assured that the committed code, that passes the continuous integration testing, respects the required formatting. The building process fails when warnings are encountered. We use the [oficial checkstyle repository](https://github.com/checkstyle/checkstyle) to obtain a stable version of _com.puppycrawl.tools.checkstyle_ dependency of the _org.apache.maven.plugins.maven-checkstyle-plugin_ plugin. The checkstyle team includes a formatter ready to be used that respects Google's rules. 

## Known Issues

Please take a look at the issues list on Github.

## Authors

* **Andy S Alic** - *Main Dev* - [asalic](https://github.com/asalic)

## License

This project is licensed under the Apache License version 2.0 - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Thanks for help go to:

* **Miguel Caballer** - [micafer](https://github.com/micafer)

* **Germán Moltó** - [gmolto](https://github.com/gmolto)
