import { isOfflineSupported, registerOfflineWorker } from "@/lib/offline/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("offline worker client", () => {
  let serviceWorkerDescriptor: PropertyDescriptor | undefined;
  let cachesDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    serviceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, "serviceWorker");
    cachesDescriptor = Object.getOwnPropertyDescriptor(window, "caches");
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
});
