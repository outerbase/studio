"use server";
import { get_database } from "@/db";
import {
  SavedDocData,
  SavedDocInput,
  SavedDocNamespace,
  SavedDocType,
} from "./saved-doc-driver";
import { getDatabaseWithAuth } from "@/lib/with-database-ops";
import { desc, eq } from "drizzle-orm";
import { dbDoc, dbDocNamespace } from "@/db/schema-doc";
import { generateId } from "lucia";
import { ApiError } from "@/lib/api-error";

async function getNamespaceWithAuth(databaseId: string, namespaceId: string) {
  const props = await getDatabaseWithAuth(databaseId);
  const { db } = props;

  const namespaceData = await db.query.dbDocNamespace.findFirst({
    where: eq(dbDocNamespace.id, namespaceId),
  });

  if (!namespaceData) {
    throw new ApiError({ message: "Namespace does not exist", status: 500 });
  }

  if (namespaceData.databaseId !== databaseId) {
    throw new ApiError({
      message: "You do not have permission to this namespace",
      status: 500,
    });
  }

  return { ...props, namespaceData };
}

async function getDocWithAuth(databaseId: string, docId: string) {
  const props = await getDatabaseWithAuth(databaseId);
  const { db } = props;

  const docData = await db.query.dbDoc.findFirst({
    where: eq(dbDoc.id, docId),
  });

  const namespaceId = docData?.namespaceId;
  if (!docData || !namespaceId) {
    throw new ApiError({ message: "Document does not exist", status: 500 });
  }

  const namespaceData = await db.query.dbDocNamespace.findFirst({
    where: eq(dbDocNamespace.id, namespaceId),
  });

  if (namespaceData?.databaseId !== databaseId) {
    throw new ApiError({
      message: "You do not have permission to this namespace",
      status: 500,
    });
  }

  return { ...props, namespaceData, docData };
}

export async function getDocNamespaceList(
  databaseId: string
): Promise<SavedDocNamespace[]> {
  const { info } = await getDatabaseWithAuth(databaseId);

  const db = get_database();
  const ns = await db.query.dbDocNamespace.findMany({
    where: eq(dbDocNamespace.databaseId, info.id),
  });

  if (ns.length === 0) {
    // Create one default namespace if it does not exist
    return [await createDocNamespace(databaseId, "Workplace")];
  }

  return ns.map((n) => {
    return {
      createdAt: n.createdAt ?? 0,
      updatedAt: n.updatedAt ?? 0,
      id: n.id,
      name: n.name ?? "Unnamed",
      databaseId: n.databaseId,
      userId: n.userId,
    };
  });
}

export async function createDocNamespace(
  databaseId: string,
  name: string
): Promise<SavedDocNamespace> {
  const { user } = await getDatabaseWithAuth(databaseId);

  const db = get_database();
  const id = generateId(15);
  const now = Math.floor(Date.now() / 1000);
  const data = {
    id,
    databaseId,
    name,
    userId: user.id,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(dbDocNamespace).values(data);
  return data;
}

export async function removeDocNamespace(
  databaseId: string,
  namespaceId: string
): Promise<void> {
  await getDatabaseWithAuth(databaseId);
  const db = get_database();

  const namespace = await db.query.dbDocNamespace.findFirst({
    where: eq(dbDocNamespace.id, namespaceId),
  });

  if (namespace?.databaseId !== databaseId) {
    throw new ApiError({
      message: "You do not have permission to remove this namespace",
      status: 500,
    });
  }

  await db.delete(dbDocNamespace).where(eq(dbDocNamespace.id, namespaceId));
}

export async function updateDocNamespace(
  databaseId: string,
  namespaceId: string,
  name: string
): Promise<SavedDocNamespace> {
  await getDatabaseWithAuth(databaseId);
  const { db, namespaceData } = await getNamespaceWithAuth(
    databaseId,
    namespaceId
  );

  const now = Math.floor(Date.now() / 1000);
  await db
    .update(dbDocNamespace)
    .set({
      name,
      updatedAt: now,
    })
    .where(eq(dbDocNamespace.id, namespaceId));

  return {
    createdAt: namespaceData.createdAt ?? now,
    id: namespaceData.id ?? "",
    updatedAt: now,
    name,
  };
}

export async function getSavedDocList(
  databaseId: string,
  namespaceId: string
): Promise<SavedDocData[]> {
  const { db, namespaceData } = await getNamespaceWithAuth(
    databaseId,
    namespaceId
  );

  const docList = await db.query.dbDoc.findMany({
    where: eq(dbDoc.namespaceId, namespaceId),
    orderBy: desc(dbDoc.createdAt),
  });

  return docList.map((item) => {
    return {
      content: item.content ?? "",
      createdAt: item.createdAt ?? 0,
      updatedAt: item.updatedAt ?? 0,
      id: item.id ?? "",
      name: item.name ?? "",
      type: (item.type ?? "sql") as SavedDocType,
      namespace: {
        id: namespaceData.id,
        name: namespaceData.name ?? "",
      },
    };
  });
}

export async function createSavedDoc(
  databaseId: string,
  namespaceId: string,
  type: SavedDocType,
  input: SavedDocInput
): Promise<SavedDocData> {
  const { db, namespaceData, user } = await getNamespaceWithAuth(
    databaseId,
    namespaceId
  );

  const now = Math.floor(Date.now() / 1000);
  const id = generateId(15);

  await db.insert(dbDoc).values({
    content: input.content,
    type: type,
    createdAt: now,
    updatedAt: now,
    id,
    lastUsedAt: now,
    name: input.name,
    namespaceId: namespaceData.id,
    userId: user.id,
  });

  return {
    id,
    content: input.content,
    createdAt: now,
    updatedAt: now,
    name: input.name,
    type: type,
    namespace: {
      id: namespaceData.id,
      name: namespaceData.name ?? "",
    },
  };
}

export async function removeSavedDoc(
  databaseId: string,
  docId: string
): Promise<void> {
  const { db } = await getDocWithAuth(databaseId, docId);
  await db.delete(dbDoc).where(eq(dbDoc.id, docId));
}

export async function updateSavedDoc(
  databaseId: string,
  docId: string,
  input: SavedDocInput
): Promise<SavedDocData> {
  const { db, docData, namespaceData } = await getDocWithAuth(
    databaseId,
    docId
  );
  const now = Math.floor(Date.now() / 1000);

  await db
    .update(dbDoc)
    .set({
      content: input.content,
      name: input.name,
      updatedAt: now,
    })
    .where(eq(dbDoc.id, docId));

  return {
    id: docId,
    content: input.content,
    createdAt: docData.createdAt ?? 0,
    updatedAt: now,
    name: input.name,
    type: (docData.type ?? "sql") as SavedDocType,
    namespace: {
      id: namespaceData.id,
      name: namespaceData.name ?? "",
    },
  };
}
