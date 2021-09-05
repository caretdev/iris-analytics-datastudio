# InterSystems IRIS Analytics connector for Google Data Studio

## Features

- Visuzalization with [Google Data Studio](https://datastudio.google.com/)
- Works with [InterSystems IRIS Analytics](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=D2GS_ch_intro) (DeepSee)
- Utilizes `/api/deepsee` [embeded](https://docs.intersystems.com/irislatest/csp/docbook/DocBook.UI.Page.cls?KEY=D2CLIENT_rest_api) in IRIS
- Generates MDX queries and execute them on the target server

## Demo Report

[Developer Community Analytics](https://datastudio.google.com/reporting/0b2fd1d2-3976-485d-ac96-d4106a892813)

## Installation and development

### Requirements

- Access to [Google Apps Script](https://script.google.com/)
- cli tool for Google Apps Script, installed globally with npm  
  `npm i @google/clasp -g`

Authorize `clasp` to get access to your account on Google Apps Script, with command

```SHELL
clasp login
```

To confirm successful authorization, may you this command

```SHELL
clasp login --status
```

Clone this repo

```SHELL
git clone https://github.com/caretdev/iris-analytics-datastudio.git
cd iris-analytics-datastudio
```

Deploy the application with one `make` command, this will create a new project on Google Apps Script, push files there, and deploy it

```SHELL
make
```

Any subsequent `make` will skip creation Google Apps Script if file `.clasp.json` exists. And will skip to create a new deployment if file `.deploymentId` exists. For existing deployment it will create a new version with the deployment id stored in file `.deploymentId`. So, after any changes in javascript files, needs to call `make` to deploy those changes.

### Usage

Open [Google Data Studio](https://datastudio.google.com/). Create a new Data Source, select "Build your own" connector.

![Build Your Own connector](https://raw.githubusercontent.com/caretdev/iris-analytics-datastudio/main/img/BuildYourOwn.png)

Enter Deployment ID stored in file `.deploymentId`, and press Validate, it should show the tile with a new connector below

![New Connector](https://raw.githubusercontent.com/caretdev/iris-analytics-datastudio/main/img/NewConnector.png)

Authorize connector, by button Authorize. Then it will be possible to enter URL to `/api/deepsee` of desired server available online, and credentials. URL should be in form `https://myiris.example.com/api/deepsee/v1/MYNAMESPACE/`, with `/api/deepsee` and target Namespace. Username and password for user with permissions to execute queryes there

![Connection Settings](https://raw.githubusercontent.com/caretdev/iris-analytics-datastudio/main/img/Connection.png)

After veerification, it will allow to select a Cube, then press Connect

![Select Cube](https://raw.githubusercontent.com/caretdev/iris-analytics-datastudio/main/img/SelectCube.png)

On the next screen it should show all the dimensions and metrics available for the selected cube

![Fields](https://raw.githubusercontent.com/caretdev/iris-analytics-datastudio/main/img/Fields.png)
