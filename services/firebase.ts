
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  updateDoc, 
  deleteDoc,
  Firestore,
  arrayUnion
} from "firebase/firestore";
import { Group, Member, Expense } from "../types";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

export const initFirebase = (config: any) => {
  try {
    if (getApps().length === 0) {
      app = initializeApp(config);
      db = getFirestore(app);
      return true;
    }
    return true;
  } catch (e) {
    console.error("Firebase init failed:", e);
    return false;
  }
};

// Collection References
export const saveGroup = async (group: Group) => {
  if (!db) return;
  await setDoc(doc(db, "groups", group.id), group);
};

export const deleteGroupDoc = async (groupId: string) => {
  if (!db) return;
  await deleteDoc(doc(db, "groups", groupId));
};

export const updateGroupExpenses = async (groupId: string, expenses: Expense[]) => {
  if (!db) return;
  const groupDoc = doc(db, "groups", groupId);
  await updateDoc(groupDoc, { expenses });
};

export const updateGroupMembers = async (groupId: string, members: Member[]) => {
  if (!db) return;
  const groupDoc = doc(db, "groups", groupId);
  await updateDoc(groupDoc, { members });
};

export const addMemberToGroup = async (groupId: string, member: Member) => {
  if (!db) return;
  const groupDoc = doc(db, "groups", groupId);
  await updateDoc(groupDoc, {
    members: arrayUnion(member)
  });
};

export const saveFriend = async (friend: Member) => {
  if (!db) return;
  await setDoc(doc(db, "friends", friend.id), friend);
};

export const subscribeToGroups = (callback: (groups: Group[]) => void, onError?: (err: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(query(collection(db, "groups")), 
    (snapshot) => {
      const groups = snapshot.docs.map(doc => doc.data() as Group);
      callback(groups);
    },
    (error) => {
      console.warn("Firestore access denied. Running in local mode.", error);
      if (onError) onError(error);
    }
  );
};

export const subscribeToFriends = (callback: (friends: Member[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(query(collection(db, "friends")), (snapshot) => {
    const friends = snapshot.docs.map(doc => doc.data() as Member);
    callback(friends);
  });
};
