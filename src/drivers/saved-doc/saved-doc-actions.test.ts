import {
  makeTestDatabase,
  makeTestUser,
  mockToken,
  setupTestDatabase,
} from "@/lib/test-helper";
import RemoteSavedDocDriver from "./remote-saved-doc";

const CURRENT_USER_ID = "user_a";
const CURRENT_USER_TOKEN = "testing_token";
const CURRENT_DATABASE_ID = "db_a";

const OTHER_USER_TOKEN = "other-user";
const OTHER_DATABASE_ID = "db_b";
const OTHER_USER_ID = "user_b";

const CREATED_NAMESPACE_NAME = "testing namespace";
const DEFAULT_NAMESPACE_NAME = "Workplace";

beforeAll(async () => {
  await setupTestDatabase();

  const user = await makeTestUser({
    id: CURRENT_USER_ID,
    sessionToken: CURRENT_USER_TOKEN,
  });

  const user2 = await makeTestUser({
    id: OTHER_USER_ID,
    sessionToken: OTHER_USER_TOKEN,
  });

  await makeTestDatabase(user, { id: CURRENT_DATABASE_ID });
  await makeTestDatabase(user2, { id: OTHER_DATABASE_ID });
});

describe("Namespace", () => {
  it("blank database should always return one namespace", async () => {
    mockToken(CURRENT_USER_TOKEN);
    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);
    expect((await remoteDoc.getNamespaces()).length).toBe(1);
  });

  it("create namespace", async () => {
    mockToken(CURRENT_USER_TOKEN);
    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);
    await remoteDoc.createNamespace(CREATED_NAMESPACE_NAME);
    expect((await remoteDoc.getNamespaces()).length).toBe(2);
  });

  it("try to create namespace in database that does not belong to user SHOULD throw error", async () => {
    mockToken(OTHER_USER_TOKEN);

    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);
    await expect(
      remoteDoc.createNamespace("other namespace")
    ).rejects.toBeTruthy();
  });

  it("create/remove/update doc inside the namespace", async () => {
    mockToken(CURRENT_USER_TOKEN);
    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);

    const defaultNamespace = (await remoteDoc.getNamespaces()).find(
      (n) => n.name === DEFAULT_NAMESPACE_NAME
    );

    const defaultNamespaceId = defaultNamespace?.id ?? "";

    const d1 = await remoteDoc.createDoc("sql", defaultNamespaceId, {
      content: "Testing",
      name: "Testing",
    });

    const d2 = await remoteDoc.createDoc("sql", defaultNamespaceId, {
      content: "Testing 2",
      name: "Testing 2",
    });

    expect((await remoteDoc.getDocs(defaultNamespaceId)).length).toBe(2);

    await remoteDoc.updateDoc(d1.id, {
      name: "Renamed Test",
      content: "Testing",
    });

    expect(
      (await remoteDoc.getDocs(defaultNamespaceId)).find((n) => n.id === d1.id)
        ?.name
    ).toBe("Renamed Test");

    await remoteDoc.removeDoc(d2.id);
    expect((await remoteDoc.getDocs(defaultNamespaceId)).length).toBe(1);
  });

  it("rename namespace", async () => {
    mockToken(CURRENT_USER_TOKEN);
    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);
    const firstNamespace = (await remoteDoc.getNamespaces())[0];
    const id = firstNamespace?.id ?? "";
    await remoteDoc.updateNamespace(id, "Renamed Namespace");

    expect(
      (await remoteDoc.getNamespaces()).find((n) => n.id === id)?.name
    ).toBe("Renamed Namespace");
  });

  it("remove namespace", async () => {
    mockToken(CURRENT_USER_TOKEN);
    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);
    const firstNamespace = (await remoteDoc.getNamespaces())[0];
    await remoteDoc.removeNamespapce(firstNamespace.id);
    expect(
      (await remoteDoc.getNamespaces()).find((r) => r.id === firstNamespace.id)
    ).not.toBeTruthy();
  });
});
