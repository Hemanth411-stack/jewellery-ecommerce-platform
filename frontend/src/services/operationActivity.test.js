import assert from "node:assert/strict";
import test from "node:test";
import axios from "axios";
import { beginOperation, isOperationPending, subscribeToOperations, trackApiOperations } from "./operationActivity.js";
import { readUpload } from "../utils/readUpload.js";

test("overlapping operations remain locked until every operation finishes", () => {
  const states = [];
  const unsubscribe = subscribeToOperations(() => states.push(isOperationPending()));
  const finishFirst = beginOperation();
  const finishSecond = beginOperation();
  finishFirst();
  finishFirst();
  assert.equal(isOperationPending(), true);
  finishSecond();
  unsubscribe();
  assert.equal(isOperationPending(), false);
  assert.deepEqual(states, [true, true, true, false]);
});

test("mutating requests lock synchronously and unlock after success", async () => {
  const requests = [];
  const api = axios.create({ adapter: (config) => new Promise((resolve) => requests.push(() => resolve({ config, data: {}, status: 200 }))) });
  trackApiOperations(api);
  for (const method of ["post", "put", "patch", "delete"]) {
    const pending = api.request({ method, url: "/test" });
    assert.equal(isOperationPending(), true);
    requests.shift()();
    await pending;
    assert.equal(isOperationPending(), false);
  }
});

test("background reads do not lock the page", async () => {
  let complete;
  const api = axios.create({ adapter: (config) => new Promise((resolve) => { complete = () => resolve({ config, data: {}, status: 200 }); }) });
  trackApiOperations(api);
  const pending = api.get("/products");
  assert.equal(isOperationPending(), false);
  complete();
  await pending;
});

test("errors and cancelled requests release the lock", async () => {
  const api = axios.create({ adapter: (config) => Promise.reject(new axios.AxiosError("Request failed", "ERR_NETWORK", config)) });
  trackApiOperations(api);
  await assert.rejects(api.post("/cart"));
  assert.equal(isOperationPending(), false);
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(api.post("/cart", {}, { signal: abort.signal }));
  assert.equal(isOperationPending(), false);
});

test("finishing one request does not unlock another pending request", async () => {
  const completions = [];
  const api = axios.create({ adapter: (config) => new Promise((resolve) => completions.push(() => resolve({ config, data: {}, status: 200 }))) });
  trackApiOperations(api);
  const first = api.post("/first");
  const second = api.post("/second");
  completions[0]();
  await first;
  assert.equal(isOperationPending(), true);
  completions[1]();
  await second;
  assert.equal(isOperationPending(), false);
});

test("file preparation unlocks on success, error, cancellation and synchronous failure", async (t) => {
  let reader;
  const previous = Object.getOwnPropertyDescriptor(globalThis, "FileReader");
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, "FileReader", previous);
    else delete globalThis.FileReader;
  });
  globalThis.FileReader = class {
    constructor() { reader = this; }
    readAsDataURL() {}
  };
  const uploaded = readUpload({ name: "photo.png" });
  assert.equal(isOperationPending(), true);
  reader.result = "data:image/png;base64,test";
  reader.onload();
  assert.equal(await uploaded, reader.result);
  assert.equal(isOperationPending(), false);
  for (const event of ["onerror", "onabort"]) {
    const pending = readUpload({ name: "photo.png" });
    reader[event]();
    await assert.rejects(pending);
    assert.equal(isOperationPending(), false);
  }
  globalThis.FileReader = class { constructor() { throw new Error("Reader unavailable"); } };
  await assert.rejects(readUpload({ name: "photo.png" }));
  assert.equal(isOperationPending(), false);
});
