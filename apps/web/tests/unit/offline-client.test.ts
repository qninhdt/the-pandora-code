import {
  activateWaitingWorker,
  isOfflineSupported,
  registerOfflineWorker,
} from "@/lib/offline/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("offline worker client", () => {
  let serviceWorkerDescriptor: PropertyDescriptor | undefined;
  let cachesDescriptor: PropertyDescriptor | undefined;
  let messageChannelDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
    cachesDescriptor = Object.getOwnPropertyDescriptor(window, "caches");
    messageChannelDescriptor = Object.getOwnPropertyDescriptor(window, "MessageChannel");
  });

  afterEach(() => {
    if (serviceWorkerDescriptor) {
      Object.defineProperty(navigator, "serviceWorker", serviceWorkerDescriptor);
    } else {
      Object.defineProperty(navigator, "serviceWorker", {
        configurable: true,
        value: undefined,
      });
    }
    if (cachesDescriptor) {
      Object.defineProperty(window, "caches", cachesDescriptor);
    } else {
      Object.defineProperty(window, "caches", {
        configurable: true,
        value: undefined,
      });
    }
    if (messageChannelDescriptor) {
      Object.defineProperty(window, "MessageChannel", messageChannelDescriptor);
    } else {
      Object.defineProperty(window, "MessageChannel", {
        configurable: true,
        value: undefined,
      });
    }
  });

  it("asks an existing registration to check for a new worker", async () => {
    const update = vi.fn().mockResolvedValue(undefined);
    const registration = { update } as unknown as ServiceWorkerRegistration;
    const register = vi.fn().mockResolvedValue(registration);
    const serviceWorker = {
      register,
      ready: Promise.resolve(registration),
    } as unknown as ServiceWorkerContainer;

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: serviceWorker,
    });
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: {},
    });

    expect(isOfflineSupported()).toBe(true);
    await registerOfflineWorker();

    expect(register).toHaveBeenCalledWith("/serwist/sw.js", { scope: "/" });
    expect(update).toHaveBeenCalledOnce();
  });

  it("waits for the new worker to activate before allowing a reload", async () => {
    class TestPort {
      peer?: TestPort;
      onmessage?: (event: MessageEvent) => void;
      close = vi.fn();

      postMessage(data: unknown) {
        queueMicrotask(() => this.peer?.onmessage?.({ data } as MessageEvent));
      }
    }

    class TestMessageChannel {
      port1 = new TestPort();
      port2 = new TestPort();

      constructor() {
        this.port1.peer = this.port2;
        this.port2.peer = this.port1;
      }
    }

    Object.defineProperty(window, "MessageChannel", {
      configurable: true,
      value: TestMessageChannel,
    });

    const worker = new EventTarget() as ServiceWorker;
    Object.defineProperty(worker, "state", { configurable: true, value: "installed" });
    worker.postMessage = vi.fn((request, ports) => {
      expect(request).toMatchObject({ type: "ACTIVATE_UPDATE" });
      (ports?.[0] as unknown as TestPort).postMessage({
        type: "RESULT",
        protocolVersion: 1,
        requestType: "ACTIVATE_UPDATE",
        ok: true,
      });
    });
    const registration = { waiting: worker } as unknown as ServiceWorkerRegistration;

    const activation = activateWaitingWorker(registration);
    await vi.waitFor(() => expect(worker.postMessage).toHaveBeenCalledOnce());
    const statusBeforeActivation = await Promise.race([
      activation.then(() => "resolved"),
      new Promise<string>((resolve) => window.setTimeout(() => resolve("pending"), 20)),
    ]);
    expect(statusBeforeActivation).toBe("pending");

    Object.defineProperty(worker, "state", { configurable: true, value: "activated" });
    worker.dispatchEvent(new Event("statechange"));

    await expect(activation).resolves.toBe(true);
  });
});
