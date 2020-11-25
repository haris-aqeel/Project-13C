#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Project14AwscdkBackendStack } from '../lib/project-14-awscdk-backend-stack';

const app = new cdk.App();
new Project14AwscdkBackendStack(app, 'Project14AwscdkBackendStack');
