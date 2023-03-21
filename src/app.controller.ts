import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { ZEEBE_CONNECTION_PROVIDER, ZeebeWorker, ZeebeJob } from 'nestjs-zeebe';
import { Ctx, Payload } from '@nestjs/microservices';
import {
  ZBClient,
  ZBWorker,
  ICustomHeaders,
  IInputVariables,
  IOutputVariables,
} from 'zeebe-node';
import { CreateProcessInstanceResponse } from 'zeebe-node/dist/lib/interfaces-grpc-1.0';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(ZEEBE_CONNECTION_PROVIDER) private readonly zbClient: ZBClient,
  ) {}

  // Use the client to create a new workflow instance
  @Get()
  getHello(): Promise<CreateProcessInstanceResponse> {
    return this.zbClient.createProcessInstance('order-process', {
      test: 1,
      or: 'romano',
    });
  }

  // Subscribe to events of type 'payment-service
  @ZeebeWorker('payment-service')
  paymentService(
    @Payload() job: ZeebeJob,
    @Ctx()
    context: {
      complete: any;
      worker: ZBWorker<IInputVariables, ICustomHeaders, IOutputVariables>;
    },
  ) {
    console.log('Payment-service, Task variables', job.variables);
    const updatedVariables = Object.assign({}, job.variables, {
      paymentService: 'Did my job',
    });

    // Task worker business logic goes here

    job.complete(updatedVariables);
  }

  // Subscribe to events of type 'inventory-service and create a worker with the options as passed below (zeebe-node ZBWorkerOptions)
  @ZeebeWorker('inventory-service', { maxJobsToActivate: 10, timeout: 300 })
  inventoryService(
    @Payload() job: ZeebeJob,
    @Ctx()
    context: {
      complete: any;
      worker: ZBWorker<IInputVariables, ICustomHeaders, IOutputVariables>;
    },
  ) {
    console.log('inventory-service, Task variables', job.variables);
    const updatedVariables = Object.assign({}, job.variables, {
      inventoryVar: 'Inventory donnnneee',
    });

    // Task worker business logic goes here
    //job.complete(updatedVariables);
    job.complete(updatedVariables);
  }

  @ZeebeWorker('disbursal-service', { maxJobsToActivate: 10, timeout: 300 })
  disbursalService(
    @Payload() job: ZeebeJob,
    @Ctx()
    context: {
      complete: any;
      worker: ZBWorker<IInputVariables, ICustomHeaders, IOutputVariables>;
    },
  ) {
    console.log('Push disbursal team tasks, Task variables', job.variables);
    const updatedVariables = Object.assign({}, job.variables, {
      inventoryVar: 'Disbursal service completed',
    });

    // Task worker business logic goes here
    //job.complete(updatedVariables);
    job.complete(updatedVariables);
  }

  @ZeebeWorker('test-service', { maxJobsToActivate: 10, timeout: 300 })
  testService(
    @Payload() job: ZeebeJob,
    @Ctx()
    context: {
      complete: any;
      worker: ZBWorker<IInputVariables, ICustomHeaders, IOutputVariables>;
    },
  ) {
    console.log('Test service', job.variables);
    const updatedVariables = Object.assign({}, job.variables, {
      inventoryVar: 'fasfass',
    });

    // Task worker business logic goes here
    //job.complete(updatedVariables);
    job.complete(updatedVariables);
  }

  @ZeebeWorker(`io.camunda.zeebe:userTask`, {
    maxJobsToActivate: 10,
    timeout: 300,
  })
  downloadDocumentService(
    @Payload() job: ZeebeJob,
    @Ctx()
    context: {
      complete: any;
      worker: ZBWorker<IInputVariables, ICustomHeaders, IOutputVariables>;
    },
  ) {
    console.log('Download Documents, Task variables', job.variables);
    const updatedVariables = Object.assign({}, job.variables, {
      inventoryVar: 'Disbursal documents download done.',
    });

    console.log(JSON.stringify(job));

    console.log(`Job key = ${job.key}`);
    // Task worker business logic goes here
    //job.complete(updatedVariables);
    // job.complete(updatedVariables);
  }

  @Get(`start-disbursal`)
  startDisbursal(): Promise<CreateProcessInstanceResponse> {
    return this.zbClient.createProcessInstance('sample-disbursal', {
      test: 1,
      or: 'romano',
    });
  }

  // @Get(`disbursement-complete`)
  // disbursalUserTaskCompleted(): Promise<CreateProcessInstanceResponse> {
  //   return this.zbClient.createProcessInstance(
  //     'disbursement-requirements-done',
  //     {
  //       test: 1,
  //       or: 'romano',
  //     },
  //   );
  // }
}
