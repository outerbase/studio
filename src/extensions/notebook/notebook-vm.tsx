import { BaseDriver } from "@/drivers/base-driver";
import { useEffect, useMemo } from "react";
import { NotebookOutputFormat } from "./notebook-block-code";

const workerCode = `
  let scope = {};
  const queryPromise = {};

  self.query = async function(sql) {
    const id = crypto.randomUUID();

    new Promise((resolve, reject) => {
      queryPromise[id] = { resolve, reject };
    });

    self.postMessage({ type: 'query', sql, id });

    return await new Promise((resolve, reject) => {
      queryPromise[id] = { resolve, reject };
    });;
  }

  self.sleep = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const nativeConsole = console.log;

  self.console.log = function(...args) {
    self.postMessage({ type: 'log', args });
  }

  self.onmessage = async function (e) {
    try {
      if (e.data.type === 'eval') {
        const asyncEval = async (code) => {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          return await new AsyncFunction('with (scope) { ' + code + ' }').call(scope);
        };
        
        await asyncEval(e.data.code);
        self.postMessage({ type: "complete" });
      } else if (e.data.type === 'query_result') {
        if (e.data.error) queryPromise[e.data.id].reject(e.data.error)
        else queryPromise[e.data.id].resolve(e.data.result);
      }
    } catch (error) {
      self.postMessage({ type: "error", args: [error.toString()] });
      self.postMessage({ type: "complete" });
    }
  };
`;

interface RunOpions {
  complete?: () => void;
  stdOut?: (data: NotebookOutputFormat) => void;
}

export class NotebookVM {
  protected vm: Worker;
  protected driver: BaseDriver;
  protected onComplete?: () => void;
  protected onStdOut?: (data: NotebookOutputFormat) => void;

  constructor(vm: Worker, driver: BaseDriver) {
    this.vm = vm;
    this.driver = driver;

    this.vm.onmessage = (e) => {
      const { type } = e.data;

      if (type === "log" || type === "error") {
        if (this.onStdOut) this.onStdOut(e.data);
      } else if (type === "query") {
        if (this.onStdOut) this.onStdOut({ ...e.data, queryStatus: "running" });

        this.driver
          .query(e.data.sql)
          .then((result) => {
            this.vm.postMessage({
              type: "query_result",
              id: e.data.id,
              result: result,
            });
            if (this.onStdOut)
              this.onStdOut({ ...e.data, queryStatus: "success" });
          })
          .catch((error) => {
            if (this.onStdOut)
              this.onStdOut({ ...e.data, queryStatus: "error" });

            if (error instanceof Error) {
              this.vm.postMessage({
                type: "query_result",
                id: e.data.id,
                error: error.message,
              });
            } else {
              this.vm.postMessage({
                type: "query_result",
                id: e.data.id,
                error: error.toString(),
              });
            }
          });
      } else if (type === "complete") {
        if (this.onComplete) {
          this.onComplete();
        }
      }
    };
  }

  run(code: string, options: RunOpions): void {
    this.onComplete = options.complete;
    this.onStdOut = options.stdOut;

    this.vm.postMessage({
      type: "eval",
      code,
    });
  }
}

export default function useNotebookVM(driver: BaseDriver): NotebookVM {
  const worker = useMemo(() => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const workerURL = URL.createObjectURL(blob);
    return new Worker(workerURL);
  }, []);

  // Cleanup the worker when the component is unmounted
  useEffect(() => {
    if (worker) {
      return () => {
        worker.terminate();
      };
    }
  }, [worker]);

  const vm = useMemo(() => new NotebookVM(worker, driver), [worker, driver]);
  return vm;
}
