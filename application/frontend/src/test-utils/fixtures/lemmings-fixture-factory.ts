import { LemmingsPatienceEngine } from '../../presentation/shared/ui/patience/variants/lemmings/lemmings-patience-engine';
import { LemmingsPlatformService } from '../../presentation/shared/ui/patience/variants/lemmings/lemmings-platform-service';

export class LemmingsFixtureFactory {
  create() {
    const container = document.createElement('div');
    container.getBoundingClientRect = () => new DOMRect(0, 0, 280, 200);
    const engine = new LemmingsPatienceEngine(2, new LemmingsPlatformService());

    return { container, engine };
  }
}
