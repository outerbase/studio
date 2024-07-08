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
    await remoteDoc.createNamespace("another namespace");
    expect((await remoteDoc.getNamespaces()).length).toBe(2);
  });

  it("try to create namespace that does not belong to user should throw error", async () => {
    mockToken(OTHER_USER_TOKEN);

    const remoteDoc = new RemoteSavedDocDriver(CURRENT_DATABASE_ID);
    await expect(
      remoteDoc.createNamespace("other namespace")
    ).rejects.toBeTruthy();
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
