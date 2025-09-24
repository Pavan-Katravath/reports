import { reportGenerationHelper } from '../helpers/reportGenerationHelper.js';

async function testReportGeneration() {
  console.log('🧪 Testing Notification Report Service...\n');

  try {
    // Test 1: Generate sample report
    console.log('📄 Test 1: Generating sample report...');
    const samplePdf = await reportGenerationHelper.generateSampleReport();
    console.log(`✅ Sample report generated successfully (${samplePdf.length} bytes)\n`);

    // Test 2: Generate custom DPG report
    console.log('📄 Test 2: Generating custom DPG report...');
    const customData = {
      param: {
        call_no: 'TEST-001',
        product_group: 'dpg',
        params: JSON.stringify({
          customer_name: 'Test Customer',
          site_name: 'Test Site',
          engineer_name: 'Test Engineer',
          report_date: new Date().toISOString().split('T')[0],
          work_performed: 'Test maintenance work performed',
          recommendations: 'Test recommendations for future maintenance'
        }),
        engineerSignature: '',
        managerSignature: '',
        dontSentEmail: true
      },
      paramObj: {
        customer_name: 'Test Customer',
        site_name: 'Test Site',
        engineer_name: 'Test Engineer',
        report_date: new Date().toISOString().split('T')[0],
        work_performed: 'Test maintenance work performed',
        recommendations: 'Test recommendations for future maintenance'
      },
      formdata: {
        safety_observations: [
          'All safety protocols were followed',
          'Personal protective equipment was used',
          'Work area was properly secured'
        ],
        work_performed: [
          'System inspection completed',
          'Preventive maintenance performed',
          'Documentation updated'
        ],
        recommendations: [
          'Schedule next maintenance in 6 months',
          'Monitor system performance',
          'Update maintenance procedures'
        ]
      },
      room: {
        name: 'test',
        customFields: {
          engineerSignature: '',
          managerSignature: ''
        }
      },
      logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA+gAAAD8CAYAAADkDI70AAABgWlDQ1BzUkdCIElFQzYxOTY2LTIuMQAAKJF1kc8rw2Ecx18bmpimOFAOS+NkmpG4OGwxCoeZMly2736pbb59v5OWq3JVlLj4deAv4KqclSJScpQzcWF9fb7bakv2eXo+z+t5P5/Pp+f5PGANpZWMXu+BTDanBQM+50J40Wl7xUInNkYYiii6OjM3EaKmfT1ItNid26xVO+5fa47FdQUsjcJjiqrlhCeFp9dzqsm7wu1KKhITPhfu0+SCwvemHi3xm8nJEv+YrIWCfrC2CjuTVRytYiWlZYTl5bgy6TWlfB/zJfZ4dn5O1m6ZXegECeDDyRTj+BlmgFHxw7jx0i87auR7ivmzrEquIl4lj8YKSVLk6BN1TarHZU2IHpeRJm/2/29f9cSgt1Td7oOGF8P46AHbDhS2DeP72DAKJ1D3DFfZSv7qEYx8ir5d0VyH4NiEi+uKFt2Dyy3oeFIjWqQo1cm0JhLwfgYtYWi7haalUs/K55w+QmhDvuoG9g+gV+Idy7/KAmgT1d6GTAAAAAlwSFlzAAALEwAACxMBAJqcGAAAIABJREFUeJzt3XeYJGXV/vHvBmCJkgQFQQGxERATisALSFwWOCSXLIgioCg/wABmRMH4vhgwgzAsUWBJhxyWaEBMmNA2K0El57Th90fVsLPDzGx3T9Vzqqrvz3Xt5bo7U+eGZbv71PPUcyYgjWJmSwOrAS8b9mN5YAlg8fzHSD9fDHgGeBJ4asiPJ4f9/AHgrmE//uXuj6f4ZxQREREREWmiCdEBpHtmtgywAfDa/H/XYH4jvnRgtEeZ37D/Ffg1cAfwazXvIiIiIiIiY1ODXmFmNgFYk6wRH+yxAfAK6vVnN4+sYb9j6A93/3tkKBERERERkSqpU5PXeHlDvj6wVf5jc2DZ0FDluh+4CZgFzHL3PwTs',
      tableHTML: '',
      returnedEls: [],
      issuedEls: []
    };

    const customPdf = await reportGenerationHelper.generateDPGReport(customData);
    console.log(`✅ Custom DPG report generated successfully (${customPdf.length} bytes)\n`);

    // Test 3: Generate Thermal report
    console.log('📄 Test 3: Generating Thermal report...');
    const thermalData = {
      ...customData,
      param: {
        ...customData.param,
        product_group: 'air'
      }
    };

    const thermalPdf = await reportGenerationHelper.generateThermalOrPowerReport(thermalData);
    console.log(`✅ Thermal report generated successfully (${thermalPdf.length} bytes)\n`);

    // Test 4: Generate DCPS report
    console.log('📄 Test 4: Generating DCPS report...');
    const dcpsData = {
      ...customData,
      param: {
        ...customData.param,
        product_group: 'dcps'
      }
    };

    const dcpsPdf = await reportGenerationHelper.generateDCPSReport(dcpsData);
    console.log(`✅ DCPS report generated successfully (${dcpsPdf.length} bytes)\n`);

    console.log('🎉 All tests passed successfully!');
    console.log('📁 Reports generated and ready for deployment.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Clean up
    await reportGenerationHelper.closeBrowser();
  }
}

// Run tests
testReportGeneration();
