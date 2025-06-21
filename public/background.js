// Helper function to get tab details
const getTabDetails = (tab) => {
  return {
    url: tab.url,
    title: tab.title,
    favIconUrl: tab.favIconUrl,
  };
};

const APP_NAME = "myTABs"; // Or your actual app name
const PARENT_MENU_ID = `addTo${APP_NAME.replace(/\s/g, "")}`;
let isUpdatingMenu = false; // Semaphore to prevent concurrent updates

// Function to build/rebuild context menus
async function buildContextMenus() {
  if (isUpdatingMenu) {
    // console.log("Context menu update already in progress. Skipping.");
    return;
  }
  isUpdatingMenu = true;
  // console.log("Building context menus...");

  try {
    await new Promise(resolve => chrome.contextMenus.removeAll(resolve));

    chrome.contextMenus.create({
      id: PARENT_MENU_ID,
      title: `Add this tab to ${APP_NAME}`,
      contexts: ["page"],
    });

    const result = await new Promise(resolve => chrome.storage.local.get(["workspaceGroups"], resolve));
    if (chrome.runtime.lastError) {
      console.error("Error fetching groups from storage:", chrome.runtime.lastError.message);
      // Fallback: only add "New Group" if fetching fails
      chrome.contextMenus.create({
        id: "NEW_GROUP_CONTEXT_MENU_ITEM",
        parentId: PARENT_MENU_ID,
        title: "New Group",
        contexts: ["page"],
      });
      isUpdatingMenu = false;
      return;
    }

    const groups = result.workspaceGroups || [];
    for (const group of groups) {
      chrome.contextMenus.create({
        id: group.id, // Use group.id as the menu item's ID
        parentId: PARENT_MENU_ID,
        title: group.title,
        contexts: ["page"],
      });
    }

    if (groups.length > 0) {
      chrome.contextMenus.create({
        id: "separator_context_menu_" + Date.now(), // Unique ID for separator
        parentId: PARENT_MENU_ID,
        type: "separator",
        contexts: ["page"],
      });
    }

    chrome.contextMenus.create({
      id: "NEW_GROUP_CONTEXT_MENU_ITEM",
      parentId: PARENT_MENU_ID,
      title: "New Group",
      contexts: ["page"],
    });
    // console.log("Context menus built successfully.");
  } catch (error) {
    console.error("Error in buildContextMenus:", error);
  } finally {
    isUpdatingMenu = false;
  }
}

// Initial setup when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`${APP_NAME} extension ${details.reason}. Setting up context menus.`);
  buildContextMenus();
});

// Listen for messages from the content script or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GROUPS_UPDATED") {
    // console.log("Background: Received GROUPS_UPDATED message. Rebuilding context menus.");
    buildContextMenus();
    sendResponse({ status: "Context menus update triggered" });
    return true;
  }
  return false; // Indicate that we are not sending a response asynchronously for other messages
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) { // Ensure tab and tab.id are present
    console.error("Tab information is not available or tab ID is missing.");
    return;
  }
  const tabDetails = getTabDetails(tab);

  if (info.menuItemId === PARENT_MENU_ID) {
    return; // Clicked on the parent item itself
  }

  let targetGroupId;
  if (info.menuItemId === "NEW_GROUP_CONTEXT_MENU_ITEM") {
    targetGroupId = "NEW_GROUP";
  } else {
    targetGroupId = info.menuItemId; // This is the group.id
  }

  const messagePayload = {
    type: "ADD_TAB_TO_GROUP_REQUEST",
    tabDetails: tabDetails,
    targetGroupId: targetGroupId,
  };

  // Try sending to the specific tab first (if it's an extension page)
  // This is less reliable for sending to the main app UI if it's not the active tab.
  // chrome.tabs.sendMessage(tab.id, messagePayload, response => { ... });

  // More reliable: send to any part of the extension listening (e.g., App.tsx)
  chrome.runtime.sendMessage(messagePayload, (response) => {
    if (chrome.runtime.lastError) {
      console.warn(
        `Could not send ADD_TAB_TO_GROUP_REQUEST (target: ${targetGroupId}) to app: ${chrome.runtime.lastError.message}. App might be closed or no active listener.`,
        "Payload:", messagePayload
      );
      // TODO: Implement storing the request in chrome.storage.local if the app is not reachable.
      // This could be useful for "offline" additions.
    } else if (response && response.status === "received") {
      // console.log(`Message ADD_TAB_TO_GROUP_REQUEST for target ${targetGroupId} received by app.`);
    } else {
      // console.log(`Message ADD_TAB_TO_GROUP_REQUEST for target ${targetGroupId} sent, but no specific confirmation "received". Response:`, response);
    }
  });
});

// Listen for startup to rebuild menus, as groups might have changed while the extension was inactive.
chrome.runtime.onStartup.addListener(() => {
  console.log(`${APP_NAME} started up. Rebuilding context menus.`);
  buildContextMenus();
});
