const puppeteer = require("puppeteer");
var program = require('commander');
var fs = require("fs");

program
  .version('0.1.0')
  .option('-h, --host <host>', 'Host that is running A4C')
  .option('-u, --adminuser <adminuser>', 'The user name of the admin user')
  .option('-p, --adminpassw <adminpassw>', 'The password of the admin user')
  .option('-t, --apptopo <apptopo>', 'The file containing the YAML automated testing application topology')
  .option('-k, --tokenendpointmock <tokenendpointmock>', 'The testing enpoint with the mock orchestrator/authentication server that returns a token')
  .option('-o, --orchestratorendpointmock <orchestratorendpointmock>', 'The testing enpoint with the mock orchestrator/authentication server that answers various deployment calls')
  .option('-c, --certificatepathmock <certificatepathmock>', 'The file which contains the certificate of the mock orchestrator/authentication server')
  .parse(process.argv);

var pageH = 1080;
var pageW = 1100;
var orchestratorInstanceName = "AutomatedOrchestratorName";
var orchestratorLocationInstanceName = "AutomatedOrchestratorLocationName";
var infrastructureType = "Deep Orchestrator";
var appName = "AutomatedApp";
var appTopo = fs.readFileSync(program.apptopo, 'utf8');
var certificateMock = fs.readFileSync(program.certificatepathmock, 'utf8');

async function getProperty(element, property) {
    return await (await element.getProperty(property)).jsonValue();
}

async function doLogin(page, adminuser, adminpassw) {
    await page.waitForSelector("input[name='userName']");
    await page.waitForSelector("input[name='userPassword']");
    await page.type("input[name='userName']", adminuser);
    await page.type("input[name='userPassword']", adminpassw);
    await page.click("button[name='btn-login']");
}

async function doCreateOrchestratorInstance(page, orchestratorInstanceName) {
    await page.waitForSelector("a[id='menu.admin']");
    await page.click("a[id='menu.admin']");
    await page.waitForSelector("a[id='homepage.am.admin.orchestrators']");
    await page.click("a[id='homepage.am.admin.orchestrators']");
    await page.waitForSelector("button[id='new-orchestrator']");
    await page.click("button[id='new-orchestrator']");
    await page.waitForSelector("input[id='orchestrator_name_id']");
    await page.type("input[id='orchestrator_name_id']", orchestratorInstanceName);
    const option = (await page.$x('//select[@name = "plugin"]/option[contains(text(), "IndigoDC")]'))[0];
  const value = await (await option.getProperty('value')).jsonValue();
  await page.select('select[name="plugin"]', value);
  await page.click("button[id='modal-create-button']");
}

async function doEnableOrchestratorInstance(page, orchestratorInstanceName, orchestratorLocationInstanceName, infrastructureType) {
    await page.waitForSelector("table.table.table-hover");
    let automatedOrchestratorRow = "//td[contains(text(), '" + orchestratorInstanceName + "')]";

    await page.waitForFunction("document.querySelector('table.table.table-hover').innerText.includes('" + orchestratorInstanceName + "')");
    let td = (await page.$x(automatedOrchestratorRow))[0];
    let tr   = (await td.$x( '..' ))[0];
    await tr.click();

    await page.waitForSelector("div[id=\"orchestrator-state\"]");
    await page.click("div[id='toast-container']").catch(e => e);

    let connectedEl = (await page.$x('//div[@id="orchestrator-state"]'))[0];
    let innerText = await getProperty(connectedEl, 'innerText');
    if (!innerText.includes('Connected')) {
      await page.waitForSelector("a[id='orchestrator-enable-button']");
      await page.click("a[id='orchestrator-enable-button']");
      await page.waitForFunction("document.querySelector('div[id=\"orchestrator-state\"]').innerText.includes('Connected')");
    }

    await page.click("a[id='menu.orchestrators.locations']");
    await page.waitForFunction("document.querySelector('a[id=\"menu.orchestrators.locations\"]').parentElement.classList.contains('active')");
    let nameEl = (await page.$x('//span[@editable-text="uiModel.locationDTO.location.name"]'))[0];
    let btnNewLoc = (await page.$x('//button[@id="new-location-button"]'))[0];
    //innerText = await getProperty(nameEl, 'innerText');
    if (nameEl === undefined && btnNewLoc !== undefined) {
      await page.waitForSelector("button[id='new-location-button']");
      await page.click("button[id='new-location-button']");
      await page.waitForSelector("input[id='location_name_id']");
      await page.type("input[id='location_name_id']", orchestratorLocationInstanceName);

      const option = (await page.$x('//select[@name = "infrastructureType"]/option[contains(text(), "' + infrastructureType + '")]'))[0];
      const value = await (await option.getProperty('value')).jsonValue();
      await page.select('select[name="infrastructureType"]', value);
      await page.click("button[id='new-location-create-button']");
    }
}

async function doSetParameters(page, tokenendpointmock, orchestratorendpointmock, certificatemock) {
  // There might be two toasts that won't disappear and would block the clicking
  await page.click("div[id='toast-container']").catch(e => e);
  await page.click("div[id='toast-container']").catch(e => e);
  await page.waitForSelector("i.fa.fa-wrench.fa-2x");
  await page.click("i.fa.fa-wrench.fa-2x");
  await page.waitForSelector("a[id='orchestrator-configuration-unlock-btn']");
  await page.click("a[id='orchestrator-configuration-unlock-btn']");
  await page.waitForSelector("button.btn-block.btn.btn-success.ng-binding[ng-click='confirm();$event.stopPropagation();']");
  await page.click("button.btn-block.btn.btn-success.ng-binding[ng-click='confirm();$event.stopPropagation();']");
  await page.waitForSelector("button.btn.btn-primary.ng-binding[ng-click='saveAction(rootObject)']");

  await setDriverConfField(page, "tokenEndpoint", tokenendpointmock);
  await setDriverConfField(page, "tokenEndpointCert", certificatemock, {delay: 0});
  await setDriverConfField(page, "orchestratorEndpoint", orchestratorendpointmock);
  await setDriverConfField(page, "orchestratorEndpointCert", certificatemock, {delay: 0});
  await setDriverConfField(page, "iamHost", orchestratorendpointmock);
  await setDriverConfField(page, "iamHostCert", certificatemock, {delay: 0});

  await page.click("button.btn.btn-primary.ng-binding[ng-click='saveAction(rootObject)']");
  await page.waitForSelector("div[id='toast-container']");
  await page.click("div[id='toast-container']").catch(e => e);


}

async function setDriverConfField(page, fieldName, val) {
  let tokenEnpointElSel = "//label[@uib-tooltip='" + fieldName + "']/following-sibling::div/div/span";
  let tokenEnpointEl = (await page.$x(tokenEnpointElSel))[0];
  await tokenEnpointEl.click();
  let inputElSel = "input.editable-input.form-control.input-sm";
  await page.waitForSelector(inputElSel);
  await clearFocusedInput(page);
  await page.type(inputElSel, val);
}

async function clearFocusedInput(page) {
  // Move the carriage to the right
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');

  await page.keyboard.press('Backspace');
}

async function doCreateApp(page, orchestratorInstanceName, appName, pageW, pageH, appTopo) {
    //await page.sleep(5000);
    const menuApp = await page.waitForSelector("a[id='menu.applications']");
    await menuApp.click();
    const btnNewApp = await page.waitForSelector("button[id='app-new-btn']");

    await page.waitFor(2000);
    //let nameEl = (await page.$x('//div[contains(string(), "' + appName + '")]/parent::div'))[0];
    let nameEl = await page.$('div[id="app_' + appName + '"]');
    //console.log(nameEl);
    if (nameEl === undefined || nameEl === null) {
      await btnNewApp.click();
      const inpName = await page.waitForSelector("input[id='nameid']");
      await inpName.type(appName);
      await page.click("button[id='btn-create']");
      await page.waitForSelector("span[editable-text=\"application.name\"]");
    } else
      await nameEl.click();

    await page.waitFor(1000);
    //await page.waitForFunction("document.querySelector('div.text-muted > table.table-condensed.grp-margin').textContent.includes('Environment')");
    let envSelXpath = "//td[contains(text(), 'Environment')]";
    await page.waitForXPath(envSelXpath);
    let td = (await page.$x(envSelXpath))[0];
    let tr = (await td.$x( '..' ))[0];
    await tr.click();

    let aTopoEl = await page.waitForSelector("a[id=\"applications.detail.environment.deploynext.topology\"]");
    await aTopoEl.click();

    let btnEditTopo = await page.waitForSelector("button[id=\"edit-topo-btn\"]");
    await btnEditTopo.click();
    let searchNodeEl = await page.waitForSelector("input[id=\"search-query\"]");
    await searchNodeEl.type("tosca.nodes.indigo.Compute");
    await searchNodeEl.type(String.fromCharCode(13));// ENTER

    const computeNodeEl = await page.waitForSelector("span[uib-tooltip=\"tosca.nodes.indigo.Compute\"]");
    const rect = await page.evaluate((computeNodeEl) => {
        const {top, left, bottom, right} = computeNodeEl.getBoundingClientRect();
        return {top, left, bottom, right};
    }, computeNodeEl);

    // Mouse actions don't work well
    // Check https://github.com/GoogleChrome/puppeteer/issues/2085
    // await page.mouse.move(rect.left, rect.top);
    // await page.mouse.down();
    // await page.mouse.move(500, 500);
    // await page.waitFor(400);
    // await page.mouse.up();
    // await page.keyboard.type(String.fromCharCode(27));// ESC

    await page.click("a[id=\"am.editor_app_env.editor.files\"]");
    await page.waitFor(1000);
    let topoSelectorEl =  (await page.$x('//div[contains(@class, "tree-label") and contains(string(), "topology.yml")]'))[0];
    await topoSelectorEl.click();
    // let textareaEl =  (await page.$x('//textarea[contains(@class, "ace_text-input")]'))[0];
    // await page.evaluate(async () => {
    //   document.querySelector("textarea.ace_text-input").value = "";
    //
    // });
    //await page.waitForFunction("document.querySelector(\"textarea.ace_text-input\").value.length > 0");

    //await page.waitForSelector("textarea.ace_text-input");
    await page.focus('textarea.ace_text-input');
    var lines = appTopo.split('\n');
    let previousIdx = 0;
    let lineSpaces = [];
    for (let line of lines) {
      let idx = 0;
      while (idx < line.length && line[idx] === ' ')
        ++idx;

      lineSpaces.push(idx);
      //await page.keyboard.type(new Array(idx).join(' '));
      await page.keyboard.type(line.trim());
      await page.keyboard.type("\n");//String.fromCharCode(13));
      // while(previousIdx > 0) {
      //    await page.keyboard.press("Backspace")// (String.fromCharCode(8));
      //    --previousIdx;
      //  }
      //  previousIdx = idx;
    }

    for (let idx=lines.length-1; idx>=0; --idx) {
      await page.keyboard.press("ArrowUp");
      await page.keyboard.press("Home");
      await page.keyboard.type(new Array(lineSpaces[idx]).join(' '));
    }

    // await page.keyboard.down('ControlLeft');
    // await page.keyboard.down('A');
    //
    // await page.keyboard.up('A');
    // await page.keyboard.up('ControlLeft');
    // await page.keyboard.down("Delete");// ENTER
    // await page.keyboard.up("Delete");// ENTER

    // await page.evaluate(appTopo => {
    //   console.log(document.querySelector("textarea.ace_text-input").value);
    //   document.querySelector("textarea.ace_text-input").value = "";
    //   document.querySelector("textarea.ace_text-input").value = appTopo;
    //
    // }, appTopo);
    //await page.waitForSelector("textarea.ace_text-input");
    //await page.keyboard.type(appTopo);
    //await page.waitForFunction("document.querySelector('textarea.ace_text-input').value.length > 0");
    //await textareaEl.type(appTopo)
    //await page.waitForFunction("document.querySelector('textarea.ace_text-input').value = \"\"");
    //await page.type('textarea[class=\"ace_text-input\"]', "tst23423423434");
    await page.waitForSelector("button[id=\"save-file\"]");
    await page.click("button[id=\"save-file\"]");

    // await page.waitForSelector("button.btn.btn-success.btn-xs.ng-binding[ng-click=\"save()\"]");
    // let saveBtnEl =  (await page.$x('//button[contains(@class, "btn-success") and contains(string(), "Save")]'))[0];
    // await saveBtnEl.click();
    let envLinkEl = (await page.$x('//a[contains(text(), "Environment")]'))[0];
    await envLinkEl.click();
    await page.waitFor(1000);
    await page.waitForSelector("button.btn-primary[ng-click=\"save()\"]");
    let saveBtnDlgEl = (await page.$x('//button[contains(@class, "btn-primary") and contains(text(), "Save")]'))[0];
    saveBtnDlgEl.click();
    let linkTopoloGyEl = await page.waitForSelector("a[id=\"applications.detail.environment.deploynext.topology\"]");
    linkTopoloGyEl.click();
    btnEditTopo = await page.waitForSelector("button[id=\"edit-topo-btn\"]");
    await btnEditTopo.click();
    envLinkEl = (await page.$x('//a[contains(text(), "Environment")]'))[0];
    await envLinkEl.click();
    //console.log(orchestratorInstanceName);
    let orchestratorBtnEl = await page.waitForSelector("span.location-match.clickable-media");//(await page.waitForXPath('//span/b[contains(@class, "ng-binding") and contains(text(), "' + orchestratorInstanceName + '")]'))[0];
    await orchestratorBtnEl.click();

    // Two get errors, get rid of them
    await page.click("div[id='toast-container']").catch(e => e);
    await page.click("div[id='toast-container']").catch(e => e);

    let linkReviewDeployEl = await page.waitForSelector("a[id=\"applications.detail.environment.deploynext.deploy\"]");
    await linkReviewDeployEl.click();
    await page.waitForSelector("button[id='btn-deploy']");
    await page.click("button[id='btn-deploy']");
    //await page.waitForXPath("a[contains(@class, \"btn-danger\") and contains(string(), \"Undeploy\")]");
    let linkUndeployEl = await page.waitForSelector("a.btn.btn-danger.ng-binding.ng-scope.disabled");
    //await page.reload();
}

puppeteer.launch({headless: false, dumpio: true,
    slowMo: 0,
    args: [
            `--window-size=1200,1000`
        ]}).then(async browser => {
  const page = await browser.newPage();
  page.on('console', consoleObj => console.log(consoleObj.text()));
  await page.setViewport({ width: pageW, height: pageH })
  console.log(program.host);
  await page.goto(program.host);

  await doLogin(page, program.adminuser, program.adminpassw);
  await doCreateOrchestratorInstance(page, orchestratorInstanceName);
  await doEnableOrchestratorInstance(page, orchestratorInstanceName, orchestratorLocationInstanceName, infrastructureType);
  await doSetParameters(page, program.tokenendpointmock, program.orchestratorendpointmock, certificateMock);
  await doCreateApp(page, orchestratorInstanceName, appName, pageW, pageH, appTopo);

	//await browser.close();
});
