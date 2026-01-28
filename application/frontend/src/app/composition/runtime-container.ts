import type { Container } from 'inversify';
import { RuntimeContainerBuilder } from './runtime-container-builder';

export const runtimeContainer: Container = new RuntimeContainerBuilder().build();
