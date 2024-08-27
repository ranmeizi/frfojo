use libloading;
use std::ffi::c_void;

type DiscordVersion = i32;
type DiscordClientId = i64;

#[derive(Debug)]
enum EDiscordResult {
    DiscordResult_Ok = 0,
    DiscordResult_ServiceUnavailable = 1,
    DiscordResult_InvalidVersion = 2,
    DiscordResult_LockFailed = 3,
    DiscordResult_InternalError = 4,
    DiscordResult_InvalidPayload = 5,
    DiscordResult_InvalidCommand = 6,
    DiscordResult_InvalidPermissions = 7,
    DiscordResult_NotFetched = 8,
    DiscordResult_NotFound = 9,
    DiscordResult_Conflict = 10,
    DiscordResult_InvalidSecret = 11,
    DiscordResult_InvalidJoinSecret = 12,
    DiscordResult_NoEligibleActivity = 13,
    DiscordResult_InvalidInvite = 14,
    DiscordResult_NotAuthenticated = 15,
    DiscordResult_InvalidAccessToken = 16,
    DiscordResult_ApplicationMismatch = 17,
    DiscordResult_InvalidDataUrl = 18,
    DiscordResult_InvalidBase64 = 19,
    DiscordResult_NotFiltered = 20,
    DiscordResult_LobbyFull = 21,
    DiscordResult_InvalidLobbySecret = 22,
    DiscordResult_InvalidFilename = 23,
    DiscordResult_InvalidFileSize = 24,
    DiscordResult_InvalidEntitlement = 25,
    DiscordResult_NotInstalled = 26,
    DiscordResult_NotRunning = 27,
    DiscordResult_InsufficientBuffer = 28,
    DiscordResult_PurchaseCanceled = 29,
    DiscordResult_InvalidGuild = 30,
    DiscordResult_InvalidEvent = 31,
    DiscordResult_InvalidChannel = 32,
    DiscordResult_InvalidOrigin = 33,
    DiscordResult_RateLimited = 34,
    DiscordResult_OAuth2Error = 35,
    DiscordResult_SelectChannelTimeout = 36,
    DiscordResult_GetGuildTimeout = 37,
    DiscordResult_SelectVoiceForceRequired = 38,
    DiscordResult_CaptureShortcutAlreadyListening = 39,
    DiscordResult_UnauthorizedForAchievement = 40,
    DiscordResult_InvalidGiftCode = 41,
    DiscordResult_PurchaseError = 42,
    DiscordResult_TransactionAborted = 43,
    DiscordResult_DrawingInitFailed = 44,
}

static DISCORD_VERSION: DiscordVersion = 3;
static DISCORD_APPLICATION_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_USER_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_IMAGE_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_ACTIVITY_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_RELATIONSHIP_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_LOBBY_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_NETWORK_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_OVERLAY_MANAGER_VERSION: DiscordVersion = 2;
static DISCORD_STORAGE_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_STORE_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_VOICE_MANAGER_VERSION: DiscordVersion = 1;
static DISCORD_ACHIEVEMENT_MANAGER_VERSION: DiscordVersion = 1;

struct DiscordCreateParams {
    pub client_id: DiscordClientId,
    pub flags: u64,
    pub events: *mut c_void,
    pub event_data: *mut c_void,
    pub application_events: *mut c_void,
    pub application_version: DiscordVersion,
    pub user_version: DiscordVersion,
    pub image_events: *mut c_void,
    pub image_version: DiscordVersion,
    pub activity_version: DiscordVersion,
    pub relationship_version: DiscordVersion,
    pub lobby_version: DiscordVersion,
    pub network_version: DiscordVersion,
    pub overlay_version: DiscordVersion,
    pub storage_events: *mut c_void,
    pub storage_version: DiscordVersion,
    pub store_version: DiscordVersion,
    pub voice_version: DiscordVersion,
    pub achievement_version: DiscordVersion,
}

#[derive(Debug)]
struct IDiscordCore {}

impl Default for DiscordCreateParams {
    fn default() -> Self {
        DiscordCreateParams {
            client_id: 0,
            flags: 0,
            events: std::ptr::null_mut(),
            event_data: std::ptr::null_mut(),
            application_events: std::ptr::null_mut(),
            image_events: std::ptr::null_mut(),
            storage_events: std::ptr::null_mut(),
            application_version: DISCORD_APPLICATION_MANAGER_VERSION,
            user_version: DISCORD_USER_MANAGER_VERSION,
            image_version: DISCORD_IMAGE_MANAGER_VERSION,
            activity_version: DISCORD_ACTIVITY_MANAGER_VERSION,
            relationship_version: DISCORD_RELATIONSHIP_MANAGER_VERSION,
            lobby_version: DISCORD_LOBBY_MANAGER_VERSION,
            network_version: DISCORD_NETWORK_MANAGER_VERSION,
            overlay_version: DISCORD_OVERLAY_MANAGER_VERSION,
            storage_version: DISCORD_STORAGE_MANAGER_VERSION,
            store_version: DISCORD_STORE_MANAGER_VERSION,
            voice_version: DISCORD_VOICE_MANAGER_VERSION,
            achievement_version: DISCORD_ACHIEVEMENT_MANAGER_VERSION,
        }
    }
}
// extern "C" {

//     fn DiscordCreate(version: DiscordVersion, params: &DiscordCreateParams)-> EDiscordResult;
// }

pub fn t() -> Result<u32, Box<dyn std::error::Error>> {
    unsafe {
        println!("start");
        let lib = libloading::Library::new("/Users/boboan/code/work/self/frfojo/src-tauri/libs/discord/x86_64/discord_game_sdk.dylib").unwrap();
        let DiscordCreate: libloading::Symbol<
            unsafe extern "C" fn(
                version: DiscordVersion,
                params: &DiscordCreateParams,
                result: &IDiscordCore,
            ) -> EDiscordResult,
        > = lib.get(b"DiscordCreate")?;

        let params = DiscordCreateParams {
            client_id: 1277822208684855370,
            ..DiscordCreateParams::default()
        };

        let mut result = IDiscordCore {};

        println!("call");
        let res: EDiscordResult = DiscordCreate(DISCORD_VERSION, &params,&result);

        println!("rrrres:{:?}", res);

    }

    Ok(1)
}
