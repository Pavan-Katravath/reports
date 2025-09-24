/**
 * Report Template Functions
 */

export const generateDPGReport = async (page, finalObject) => {
  await page.evaluate((finalObject) => {
    function setData(el, data) {
      const element = document.getElementById(el);
      if (element) {
        element.textContent = data || '';
      }
    }

    function setImage(el, data) {
      const element = document.getElementById(el);
      if (element && data) {
        element.src = data;
      }
    }

    function setHTML(el, data) {
      const element = document.getElementById(el);
      if (element) {
        element.innerHTML = data || '';
      }
    }

    // Set basic data
    setData('call_no', finalObject.param?.call_no || '');
    setData('customer_name', finalObject.paramObj?.customer_name || '');
    setData('site_name', finalObject.paramObj?.site_name || '');
    setData('engineer_name', finalObject.paramObj?.engineer_name || '');
    setData('report_date', finalObject.paramObj?.report_date || '');
    setData('work_performed', finalObject.paramObj?.work_performed || '');
    setData('recommendations', finalObject.paramObj?.recommendations || '');

    // Set signatures
    if (finalObject.param?.engineerSignature) {
      setImage('engineer_signature', finalObject.param.engineerSignature);
    }
    if (finalObject.param?.managerSignature) {
      setImage('manager_signature', finalObject.param.managerSignature);
    }

    // Set form data
    if (finalObject.formdata) {
      const { safety_observations, work_performed, recommendations } = finalObject.formdata;
      
      if (safety_observations && Array.isArray(safety_observations)) {
        setHTML('safety_observations', safety_observations.map(obs => `<li>${obs}</li>`).join(''));
      }
      
      if (work_performed && Array.isArray(work_performed)) {
        setHTML('work_performed_list', work_performed.map(work => `<li>${work}</li>`).join(''));
      }
      
      if (recommendations && Array.isArray(recommendations)) {
        setHTML('recommendations_list', recommendations.map(rec => `<li>${rec}</li>`).join(''));
      }
    }

    // Set logo
    if (finalObject.logo) {
      setImage('logo', finalObject.logo);
    }

  }, finalObject);

  return await page.pdf({
    margin: {
      top: '5mm',
      right: '5mm',
      bottom: '5mm',
      left: '5mm',
    },
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="font-size: 10px; text-align: center;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });
};

export const generateThermalOrPowerReport = async (page, finalObject) => {
  return await generateDPGReport(page, finalObject);
};

export const generateDCPSReport = async (page, finalObject) => {
  return await generateDPGReport(page, finalObject);
};