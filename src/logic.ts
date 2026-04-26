import type { ApiClient } from 'vtubestudio';

export class Logic {
  private vts: ApiClient;
  private isRunning: boolean = false;
  private worker: Worker | null = null;
  private workerUrl: string | null = null;

  constructor(vtsClient: ApiClient) {
    this.vts = vtsClient;
  }

  public async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.startWorker();
    console.log("Engine started at 60fps");
  }

  private startWorker() {
    const workerCode = `
      let timer = null;
      self.onmessage = (e) => {
        if (e.data === 'start') {
          timer = setInterval(() => self.postMessage('tick'), 16); 
        } else if (e.data === 'stop') {
          clearInterval(timer);
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(this.workerUrl);

    this.worker.onmessage = () => {
      this.syncFrame();
    };

    this.worker.postMessage('start');
  }

  private syncFrame() {
    if (!this.isRunning) return;
    // Implement your sync logic here
  }

  public stop() {
    this.isRunning = false;
    
    this.worker?.postMessage('stop');
    this.worker?.terminate();
    if (this.workerUrl) {
      URL.revokeObjectURL(this.workerUrl);
      this.workerUrl = null;
    }
    
    console.log("Engine stopped");
  }
}