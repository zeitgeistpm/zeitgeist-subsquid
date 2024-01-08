import {sts, Result, Option, Bytes, BitSequence} from './support'

export type MarketId = bigint

export interface Market {
    creator: AccountId
    creation: MarketCreation
    creatorFee: number
    oracle: AccountId
    metadata: Bytes
    marketType: MarketType
    period: MarketPeriod
    scoringRule: ScoringRule
    status: MarketStatus
    report?: (Report | undefined)
    resolvedOutcome?: (Outcome | undefined)
    mdm: MarketDisputeMechanism
}

export type MarketDisputeMechanism = MarketDisputeMechanism_Authorized | MarketDisputeMechanism_Court | MarketDisputeMechanism_SimpleDisputes

export interface MarketDisputeMechanism_Authorized {
    __kind: 'Authorized'
    value: AccountId
}

export interface MarketDisputeMechanism_Court {
    __kind: 'Court'
}

export interface MarketDisputeMechanism_SimpleDisputes {
    __kind: 'SimpleDisputes'
}

export type Outcome = Outcome_Complete | Outcome_Error | Outcome_Incomplete

export interface Outcome_Complete {
    __kind: 'Complete'
    value: Weight
}

export interface Outcome_Error {
    __kind: 'Error'
    value: XcmErrorV0
}

export interface Outcome_Incomplete {
    __kind: 'Incomplete'
    value: [Weight, XcmErrorV0]
}

export type XcmErrorV0 = XcmErrorV0_AssetNotFound | XcmErrorV0_BadOrigin | XcmErrorV0_Barrier | XcmErrorV0_CannotReachDestination | XcmErrorV0_DestinationBufferOverflow | XcmErrorV0_EscalationOfPrivilege | XcmErrorV0_ExceedsMaxMessageSize | XcmErrorV0_FailedToDecode | XcmErrorV0_FailedToTransactAsset | XcmErrorV0_LocationCannotHold | XcmErrorV0_MultiLocationFull | XcmErrorV0_NotHoldingFees | XcmErrorV0_NotWithdrawable | XcmErrorV0_Overflow | XcmErrorV0_RecursionLimitReached | XcmErrorV0_SendFailed | XcmErrorV0_TooExpensive | XcmErrorV0_TooMuchWeightRequired | XcmErrorV0_Undefined | XcmErrorV0_UnhandledEffect | XcmErrorV0_UnhandledXcmMessage | XcmErrorV0_UnhandledXcmVersion | XcmErrorV0_Unimplemented | XcmErrorV0_UntrustedReserveLocation | XcmErrorV0_UntrustedTeleportLocation | XcmErrorV0_WeightLimitReached | XcmErrorV0_WeightNotComputable | XcmErrorV0_Wildcard

export interface XcmErrorV0_AssetNotFound {
    __kind: 'AssetNotFound'
}

export interface XcmErrorV0_BadOrigin {
    __kind: 'BadOrigin'
}

export interface XcmErrorV0_Barrier {
    __kind: 'Barrier'
}

export interface XcmErrorV0_CannotReachDestination {
    __kind: 'CannotReachDestination'
    value: [MultiLocation, InstructionV2[]]
}

export interface XcmErrorV0_DestinationBufferOverflow {
    __kind: 'DestinationBufferOverflow'
}

export interface XcmErrorV0_EscalationOfPrivilege {
    __kind: 'EscalationOfPrivilege'
}

export interface XcmErrorV0_ExceedsMaxMessageSize {
    __kind: 'ExceedsMaxMessageSize'
}

export interface XcmErrorV0_FailedToDecode {
    __kind: 'FailedToDecode'
}

export interface XcmErrorV0_FailedToTransactAsset {
    __kind: 'FailedToTransactAsset'
}

export interface XcmErrorV0_LocationCannotHold {
    __kind: 'LocationCannotHold'
}

export interface XcmErrorV0_MultiLocationFull {
    __kind: 'MultiLocationFull'
}

export interface XcmErrorV0_NotHoldingFees {
    __kind: 'NotHoldingFees'
}

export interface XcmErrorV0_NotWithdrawable {
    __kind: 'NotWithdrawable'
}

export interface XcmErrorV0_Overflow {
    __kind: 'Overflow'
}

export interface XcmErrorV0_RecursionLimitReached {
    __kind: 'RecursionLimitReached'
}

export interface XcmErrorV0_SendFailed {
    __kind: 'SendFailed'
}

export interface XcmErrorV0_TooExpensive {
    __kind: 'TooExpensive'
}

export interface XcmErrorV0_TooMuchWeightRequired {
    __kind: 'TooMuchWeightRequired'
}

export interface XcmErrorV0_Undefined {
    __kind: 'Undefined'
}

export interface XcmErrorV0_UnhandledEffect {
    __kind: 'UnhandledEffect'
}

export interface XcmErrorV0_UnhandledXcmMessage {
    __kind: 'UnhandledXcmMessage'
}

export interface XcmErrorV0_UnhandledXcmVersion {
    __kind: 'UnhandledXcmVersion'
}

export interface XcmErrorV0_Unimplemented {
    __kind: 'Unimplemented'
}

export interface XcmErrorV0_UntrustedReserveLocation {
    __kind: 'UntrustedReserveLocation'
}

export interface XcmErrorV0_UntrustedTeleportLocation {
    __kind: 'UntrustedTeleportLocation'
}

export interface XcmErrorV0_WeightLimitReached {
    __kind: 'WeightLimitReached'
    value: Weight
}

export interface XcmErrorV0_WeightNotComputable {
    __kind: 'WeightNotComputable'
}

export interface XcmErrorV0_Wildcard {
    __kind: 'Wildcard'
}

export type InstructionV2 = InstructionV2_BuyExecution | InstructionV2_ClaimAsset | InstructionV2_ClearError | InstructionV2_ClearOrigin | InstructionV2_DepositAsset | InstructionV2_DepositReserveAsset | InstructionV2_DescendOrigin | InstructionV2_ExchangeAsset | InstructionV2_HrmpChannelAccepted | InstructionV2_HrmpChannelClosing | InstructionV2_HrmpNewChannelOpenRequest | InstructionV2_InitiateReserveWithdraw | InstructionV2_InitiateTeleport | InstructionV2_QueryHolding | InstructionV2_QueryResponse | InstructionV2_ReceiveTeleportedAsset | InstructionV2_RefundSurplus | InstructionV2_ReportError | InstructionV2_ReserveAssetDeposited | InstructionV2_SetAppendix | InstructionV2_SetErrorHandler | InstructionV2_Transact | InstructionV2_TransferAsset | InstructionV2_TransferReserveAsset | InstructionV2_Trap | InstructionV2_WithdrawAsset

export interface InstructionV2_BuyExecution {
    __kind: 'BuyExecution'
    fees: MultiAssetV2
    weightLimit: WeightLimitV2
}

export interface InstructionV2_ClaimAsset {
    __kind: 'ClaimAsset'
    assets: MultiAssetV1[]
    ticket: MultiLocationV2
}

export interface InstructionV2_ClearError {
    __kind: 'ClearError'
}

export interface InstructionV2_ClearOrigin {
    __kind: 'ClearOrigin'
}

export interface InstructionV2_DepositAsset {
    __kind: 'DepositAsset'
    assets: MultiAssetFilterV2
    maxAssets: number
    beneficiary: MultiLocationV2
}

export interface InstructionV2_DepositReserveAsset {
    __kind: 'DepositReserveAsset'
    assets: MultiAssetFilterV2
    maxAssets: number
    dest: MultiLocationV2
    xcm: InstructionV2[]
}

export interface InstructionV2_DescendOrigin {
    __kind: 'DescendOrigin'
    value: InteriorMultiLocation
}

export interface InstructionV2_ExchangeAsset {
    __kind: 'ExchangeAsset'
    give: MultiAssetFilterV2
    receive: MultiAssetV1[]
}

export interface InstructionV2_HrmpChannelAccepted {
    __kind: 'HrmpChannelAccepted'
    recipient: number
}

export interface InstructionV2_HrmpChannelClosing {
    __kind: 'HrmpChannelClosing'
    initiator: number
    sender: number
    recipient: number
}

export interface InstructionV2_HrmpNewChannelOpenRequest {
    __kind: 'HrmpNewChannelOpenRequest'
    sender: number
    maxMessageSize: number
    maxCapacity: number
}

export interface InstructionV2_InitiateReserveWithdraw {
    __kind: 'InitiateReserveWithdraw'
    assets: MultiAssetFilterV2
    reserve: MultiLocationV2
    xcm: InstructionV2[]
}

export interface InstructionV2_InitiateTeleport {
    __kind: 'InitiateTeleport'
    assets: MultiAssetFilterV2
    dest: MultiLocationV2
    xcm: InstructionV2[]
}

export interface InstructionV2_QueryHolding {
    __kind: 'QueryHolding'
    queryId: bigint
    dest: MultiLocationV2
    assets: MultiAssetFilterV2
    maxResponseWeight: bigint
}

export interface InstructionV2_QueryResponse {
    __kind: 'QueryResponse'
    queryId: bigint
    response: ResponseV2
    maxWeight: bigint
}

export interface InstructionV2_ReceiveTeleportedAsset {
    __kind: 'ReceiveTeleportedAsset'
    value: MultiAssetV1[]
}

export interface InstructionV2_RefundSurplus {
    __kind: 'RefundSurplus'
}

export interface InstructionV2_ReportError {
    __kind: 'ReportError'
    queryId: bigint
    dest: MultiLocationV2
    maxResponseWeight: bigint
}

export interface InstructionV2_ReserveAssetDeposited {
    __kind: 'ReserveAssetDeposited'
    value: MultiAssetV1[]
}

export interface InstructionV2_SetAppendix {
    __kind: 'SetAppendix'
    value: InstructionV2[]
}

export interface InstructionV2_SetErrorHandler {
    __kind: 'SetErrorHandler'
    value: InstructionV2[]
}

export interface InstructionV2_Transact {
    __kind: 'Transact'
    originType: OriginKindV2
    requireWeightAtMost: bigint
    call: DoubleEncodedCall
}

export interface InstructionV2_TransferAsset {
    __kind: 'TransferAsset'
    assets: MultiAssetV1[]
    beneficiary: MultiLocationV2
}

export interface InstructionV2_TransferReserveAsset {
    __kind: 'TransferReserveAsset'
    assets: MultiAssetV1[]
    dest: MultiLocationV2
    xcm: InstructionV2[]
}

export interface InstructionV2_Trap {
    __kind: 'Trap'
    value: bigint
}

export interface InstructionV2_WithdrawAsset {
    __kind: 'WithdrawAsset'
    value: MultiAssetV1[]
}

export interface DoubleEncodedCall {
    encoded: Bytes
}

export type OriginKindV2 = OriginKindV2_Native | OriginKindV2_SovereignAccount | OriginKindV2_Superuser | OriginKindV2_Xcm

export interface OriginKindV2_Native {
    __kind: 'Native'
}

export interface OriginKindV2_SovereignAccount {
    __kind: 'SovereignAccount'
}

export interface OriginKindV2_Superuser {
    __kind: 'Superuser'
}

export interface OriginKindV2_Xcm {
    __kind: 'Xcm'
}

export type ResponseV2 = ResponseV2_Assets | ResponseV2_ExecutionResult | ResponseV2_Null

export interface ResponseV2_Assets {
    __kind: 'Assets'
    value: MultiAssetV1[]
}

export interface ResponseV2_ExecutionResult {
    __kind: 'ExecutionResult'
    value: ResponseV2Result
}

export interface ResponseV2_Null {
    __kind: 'Null'
}

export type ResponseV2Result = Result<null, ResponseV2Error>

export type ResponseV2Error = [number, XcmErrorV2]

export type XcmErrorV2 = XcmErrorV2_AssetNotFound | XcmErrorV2_BadOrigin | XcmErrorV2_Barrier | XcmErrorV2_DestinationBufferOverflow | XcmErrorV2_DestinationUnsupported | XcmErrorV2_EscalationOfPrivilege | XcmErrorV2_ExceedsMaxMessageSize | XcmErrorV2_FailedToDecode | XcmErrorV2_FailedToTransactAsset | XcmErrorV2_InvalidLocation | XcmErrorV2_LocationCannotHold | XcmErrorV2_MultiLocationFull | XcmErrorV2_MultiLocationNotInvertible | XcmErrorV2_NotHoldingFees | XcmErrorV2_NotWithdrawable | XcmErrorV2_Overflow | XcmErrorV2_RecursionLimitReached | XcmErrorV2_TooExpensive | XcmErrorV2_TooMuchWeightRequired | XcmErrorV2_Transport | XcmErrorV2_Trap | XcmErrorV2_Undefined | XcmErrorV2_UnhandledEffect | XcmErrorV2_UnhandledXcmMessage | XcmErrorV2_UnhandledXcmVersion | XcmErrorV2_Unimplemented | XcmErrorV2_UnknownClaim | XcmErrorV2_UnknownWeightRequired | XcmErrorV2_Unroutable | XcmErrorV2_UntrustedReserveLocation | XcmErrorV2_UntrustedTeleportLocation | XcmErrorV2_WeightLimitReached | XcmErrorV2_WeightNotComputable | XcmErrorV2_Wildcard

export interface XcmErrorV2_AssetNotFound {
    __kind: 'AssetNotFound'
}

export interface XcmErrorV2_BadOrigin {
    __kind: 'BadOrigin'
}

export interface XcmErrorV2_Barrier {
    __kind: 'Barrier'
}

export interface XcmErrorV2_DestinationBufferOverflow {
    __kind: 'DestinationBufferOverflow'
}

export interface XcmErrorV2_DestinationUnsupported {
    __kind: 'DestinationUnsupported'
}

export interface XcmErrorV2_EscalationOfPrivilege {
    __kind: 'EscalationOfPrivilege'
}

export interface XcmErrorV2_ExceedsMaxMessageSize {
    __kind: 'ExceedsMaxMessageSize'
}

export interface XcmErrorV2_FailedToDecode {
    __kind: 'FailedToDecode'
}

export interface XcmErrorV2_FailedToTransactAsset {
    __kind: 'FailedToTransactAsset'
}

export interface XcmErrorV2_InvalidLocation {
    __kind: 'InvalidLocation'
}

export interface XcmErrorV2_LocationCannotHold {
    __kind: 'LocationCannotHold'
}

export interface XcmErrorV2_MultiLocationFull {
    __kind: 'MultiLocationFull'
}

export interface XcmErrorV2_MultiLocationNotInvertible {
    __kind: 'MultiLocationNotInvertible'
}

export interface XcmErrorV2_NotHoldingFees {
    __kind: 'NotHoldingFees'
}

export interface XcmErrorV2_NotWithdrawable {
    __kind: 'NotWithdrawable'
}

export interface XcmErrorV2_Overflow {
    __kind: 'Overflow'
}

export interface XcmErrorV2_RecursionLimitReached {
    __kind: 'RecursionLimitReached'
}

export interface XcmErrorV2_TooExpensive {
    __kind: 'TooExpensive'
}

export interface XcmErrorV2_TooMuchWeightRequired {
    __kind: 'TooMuchWeightRequired'
}

export interface XcmErrorV2_Transport {
    __kind: 'Transport'
}

export interface XcmErrorV2_Trap {
    __kind: 'Trap'
    value: bigint
}

export interface XcmErrorV2_Undefined {
    __kind: 'Undefined'
}

export interface XcmErrorV2_UnhandledEffect {
    __kind: 'UnhandledEffect'
}

export interface XcmErrorV2_UnhandledXcmMessage {
    __kind: 'UnhandledXcmMessage'
}

export interface XcmErrorV2_UnhandledXcmVersion {
    __kind: 'UnhandledXcmVersion'
}

export interface XcmErrorV2_Unimplemented {
    __kind: 'Unimplemented'
}

export interface XcmErrorV2_UnknownClaim {
    __kind: 'UnknownClaim'
}

export interface XcmErrorV2_UnknownWeightRequired {
    __kind: 'UnknownWeightRequired'
}

export interface XcmErrorV2_Unroutable {
    __kind: 'Unroutable'
}

export interface XcmErrorV2_UntrustedReserveLocation {
    __kind: 'UntrustedReserveLocation'
}

export interface XcmErrorV2_UntrustedTeleportLocation {
    __kind: 'UntrustedTeleportLocation'
}

export interface XcmErrorV2_WeightLimitReached {
    __kind: 'WeightLimitReached'
    value: Weight
}

export interface XcmErrorV2_WeightNotComputable {
    __kind: 'WeightNotComputable'
}

export interface XcmErrorV2_Wildcard {
    __kind: 'Wildcard'
}

export type InteriorMultiLocation = InteriorMultiLocation_Here | InteriorMultiLocation_X1 | InteriorMultiLocation_X2 | InteriorMultiLocation_X3 | InteriorMultiLocation_X4 | InteriorMultiLocation_X5 | InteriorMultiLocation_X6 | InteriorMultiLocation_X7 | InteriorMultiLocation_X8

export interface InteriorMultiLocation_Here {
    __kind: 'Here'
}

export interface InteriorMultiLocation_X1 {
    __kind: 'X1'
    value: JunctionV1
}

export interface InteriorMultiLocation_X2 {
    __kind: 'X2'
    value: [JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X3 {
    __kind: 'X3'
    value: [JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X4 {
    __kind: 'X4'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X5 {
    __kind: 'X5'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X6 {
    __kind: 'X6'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X7 {
    __kind: 'X7'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface InteriorMultiLocation_X8 {
    __kind: 'X8'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export type JunctionV1 = JunctionV1_AccountId32 | JunctionV1_AccountIndex64 | JunctionV1_AccountKey20 | JunctionV1_GeneralIndex | JunctionV1_GeneralKey | JunctionV1_OnlyChild | JunctionV1_PalletInstance | JunctionV1_Parachain | JunctionV1_Plurality

export interface JunctionV1_AccountId32 {
    __kind: 'AccountId32'
    network: NetworkId
    id: AccountId
}

export interface JunctionV1_AccountIndex64 {
    __kind: 'AccountIndex64'
    network: NetworkId
    index: bigint
}

export interface JunctionV1_AccountKey20 {
    __kind: 'AccountKey20'
    network: NetworkId
    key: Bytes
}

export interface JunctionV1_GeneralIndex {
    __kind: 'GeneralIndex'
    value: bigint
}

export interface JunctionV1_GeneralKey {
    __kind: 'GeneralKey'
    value: Bytes
}

export interface JunctionV1_OnlyChild {
    __kind: 'OnlyChild'
}

export interface JunctionV1_PalletInstance {
    __kind: 'PalletInstance'
    value: number
}

export interface JunctionV1_Parachain {
    __kind: 'Parachain'
    value: number
}

export interface JunctionV1_Plurality {
    __kind: 'Plurality'
    id: BodyId
    part: BodyPart
}

export type BodyPart = BodyPart_AtLeastProportion | BodyPart_Fraction | BodyPart_Members | BodyPart_MoreThanProportion | BodyPart_Voice

export interface BodyPart_AtLeastProportion {
    __kind: 'AtLeastProportion'
    nom: number
    denom: number
}

export interface BodyPart_Fraction {
    __kind: 'Fraction'
    nom: number
    denom: number
}

export interface BodyPart_Members {
    __kind: 'Members'
    value: number
}

export interface BodyPart_MoreThanProportion {
    __kind: 'MoreThanProportion'
    nom: number
    denom: number
}

export interface BodyPart_Voice {
    __kind: 'Voice'
}

export type BodyId = BodyId_Executive | BodyId_Index | BodyId_Judicial | BodyId_Legislative | BodyId_Named | BodyId_Technical | BodyId_Unit

export interface BodyId_Executive {
    __kind: 'Executive'
}

export interface BodyId_Index {
    __kind: 'Index'
    value: number
}

export interface BodyId_Judicial {
    __kind: 'Judicial'
}

export interface BodyId_Legislative {
    __kind: 'Legislative'
}

export interface BodyId_Named {
    __kind: 'Named'
    value: Bytes
}

export interface BodyId_Technical {
    __kind: 'Technical'
}

export interface BodyId_Unit {
    __kind: 'Unit'
}

export type NetworkId = NetworkId_Any | NetworkId_Kusama | NetworkId_Named | NetworkId_Polkadot

export interface NetworkId_Any {
    __kind: 'Any'
}

export interface NetworkId_Kusama {
    __kind: 'Kusama'
}

export interface NetworkId_Named {
    __kind: 'Named'
    value: Bytes
}

export interface NetworkId_Polkadot {
    __kind: 'Polkadot'
}

export type MultiAssetFilterV2 = MultiAssetFilterV2_Definite | MultiAssetFilterV2_Wild

export interface MultiAssetFilterV2_Definite {
    __kind: 'Definite'
    value: MultiAssetV1[]
}

export interface MultiAssetFilterV2_Wild {
    __kind: 'Wild'
    value: WildMultiAssetV1
}

export type WildMultiAssetV1 = WildMultiAssetV1_All | WildMultiAssetV1_AllOf

export interface WildMultiAssetV1_All {
    __kind: 'All'
}

export interface WildMultiAssetV1_AllOf {
    __kind: 'AllOf'
    id: XcmAssetId
    fungibility: WildFungibilityV1
}

export type WildFungibilityV1 = WildFungibilityV1_Fungible | WildFungibilityV1_NonFungible

export interface WildFungibilityV1_Fungible {
    __kind: 'Fungible'
}

export interface WildFungibilityV1_NonFungible {
    __kind: 'NonFungible'
}

export type XcmAssetId = XcmAssetId_Abstract | XcmAssetId_Concrete

export interface XcmAssetId_Abstract {
    __kind: 'Abstract'
    value: Bytes
}

export interface XcmAssetId_Concrete {
    __kind: 'Concrete'
    value: MultiLocation
}

export interface MultiLocationV2 {
    parents: number
    interior: JunctionsV1
}

export type JunctionsV1 = JunctionsV1_Here | JunctionsV1_X1 | JunctionsV1_X2 | JunctionsV1_X3 | JunctionsV1_X4 | JunctionsV1_X5 | JunctionsV1_X6 | JunctionsV1_X7 | JunctionsV1_X8

export interface JunctionsV1_Here {
    __kind: 'Here'
}

export interface JunctionsV1_X1 {
    __kind: 'X1'
    value: JunctionV1
}

export interface JunctionsV1_X2 {
    __kind: 'X2'
    value: [JunctionV1, JunctionV1]
}

export interface JunctionsV1_X3 {
    __kind: 'X3'
    value: [JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X4 {
    __kind: 'X4'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X5 {
    __kind: 'X5'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X6 {
    __kind: 'X6'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X7 {
    __kind: 'X7'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface JunctionsV1_X8 {
    __kind: 'X8'
    value: [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]
}

export interface MultiAssetV1 {
    id: XcmAssetId
    fungibility: FungibilityV1
}

export type FungibilityV1 = FungibilityV1_Fungible | FungibilityV1_NonFungible

export interface FungibilityV1_Fungible {
    __kind: 'Fungible'
    value: bigint
}

export interface FungibilityV1_NonFungible {
    __kind: 'NonFungible'
    value: AssetInstanceV1
}

export type AssetInstanceV1 = AssetInstanceV1_Array16 | AssetInstanceV1_Array32 | AssetInstanceV1_Array4 | AssetInstanceV1_Array8 | AssetInstanceV1_Blob | AssetInstanceV1_Index | AssetInstanceV1_Undefined

export interface AssetInstanceV1_Array16 {
    __kind: 'Array16'
    value: Bytes
}

export interface AssetInstanceV1_Array32 {
    __kind: 'Array32'
    value: Bytes
}

export interface AssetInstanceV1_Array4 {
    __kind: 'Array4'
    value: Bytes
}

export interface AssetInstanceV1_Array8 {
    __kind: 'Array8'
    value: Bytes
}

export interface AssetInstanceV1_Blob {
    __kind: 'Blob'
    value: Bytes
}

export interface AssetInstanceV1_Index {
    __kind: 'Index'
    value: bigint
}

export interface AssetInstanceV1_Undefined {
    __kind: 'Undefined'
}

export type WeightLimitV2 = WeightLimitV2_Limited | WeightLimitV2_Unlimited

export interface WeightLimitV2_Limited {
    __kind: 'Limited'
    value: bigint
}

export interface WeightLimitV2_Unlimited {
    __kind: 'Unlimited'
}

export interface MultiAssetV2 {
    id: XcmAssetId
    fungibility: FungibilityV1
}

export interface MultiLocation {
    parents: number
    interior: JunctionsV1
}

export type Weight = bigint

export interface Report {
    at: BlockNumber
    by: AccountId
    outcome: OutcomeReport
}

export type OutcomeReport = OutcomeReport_Categorical | OutcomeReport_Scalar

export interface OutcomeReport_Categorical {
    __kind: 'Categorical'
    value: number
}

export interface OutcomeReport_Scalar {
    __kind: 'Scalar'
    value: bigint
}

export type BlockNumber = bigint

export type MarketStatus = MarketStatus_Active | MarketStatus_Closed | MarketStatus_CollectingSubsidy | MarketStatus_Disputed | MarketStatus_InsufficientSubsidy | MarketStatus_Proposed | MarketStatus_Reported | MarketStatus_Resolved | MarketStatus_Suspended

export interface MarketStatus_Active {
    __kind: 'Active'
}

export interface MarketStatus_Closed {
    __kind: 'Closed'
}

export interface MarketStatus_CollectingSubsidy {
    __kind: 'CollectingSubsidy'
}

export interface MarketStatus_Disputed {
    __kind: 'Disputed'
}

export interface MarketStatus_InsufficientSubsidy {
    __kind: 'InsufficientSubsidy'
}

export interface MarketStatus_Proposed {
    __kind: 'Proposed'
}

export interface MarketStatus_Reported {
    __kind: 'Reported'
}

export interface MarketStatus_Resolved {
    __kind: 'Resolved'
}

export interface MarketStatus_Suspended {
    __kind: 'Suspended'
}

export type ScoringRule = ScoringRule_CPMM | ScoringRule_RikiddoSigmoidFeeMarketEma

export interface ScoringRule_CPMM {
    __kind: 'CPMM'
}

export interface ScoringRule_RikiddoSigmoidFeeMarketEma {
    __kind: 'RikiddoSigmoidFeeMarketEma'
}

export type MarketPeriod = MarketPeriod_Block | MarketPeriod_Timestamp

export interface MarketPeriod_Block {
    __kind: 'Block'
    value: [BlockNumber, BlockNumber]
}

export interface MarketPeriod_Timestamp {
    __kind: 'Timestamp'
    value: [Moment, Moment]
}

export type Moment = bigint

export type MarketType = MarketType_Categorical | MarketType_Scalar

export interface MarketType_Categorical {
    __kind: 'Categorical'
    value: number
}

export interface MarketType_Scalar {
    __kind: 'Scalar'
    value: [bigint, bigint]
}

export type MarketCreation = MarketCreation_Advised | MarketCreation_Permissionless

export interface MarketCreation_Advised {
    __kind: 'Advised'
}

export interface MarketCreation_Permissionless {
    __kind: 'Permissionless'
}

export type AccountId = Bytes

export const MarketId = sts.bigint()

export const PoolId = sts.bigint()

export const BalanceOf = sts.bigint()

export const OutcomeReport: sts.Type<OutcomeReport> = sts.closedEnum(() => {
    return  {
        Categorical: sts.number(),
        Scalar: sts.bigint(),
    }
})

export const Market: sts.Type<Market> = sts.struct(() => {
    return  {
        creator: AccountId,
        creation: MarketCreation,
        creatorFee: sts.number(),
        oracle: AccountId,
        metadata: sts.bytes(),
        marketType: MarketType,
        period: MarketPeriod,
        scoringRule: ScoringRule,
        status: MarketStatus,
        report: sts.option(() => Report),
        resolvedOutcome: sts.option(() => Outcome),
        mdm: MarketDisputeMechanism,
    }
})

export const MarketDisputeMechanism: sts.Type<MarketDisputeMechanism> = sts.closedEnum(() => {
    return  {
        Authorized: AccountId,
        Court: sts.unit(),
        SimpleDisputes: sts.unit(),
    }
})

export const Outcome: sts.Type<Outcome> = sts.closedEnum(() => {
    return  {
        Complete: Weight,
        Error: XcmErrorV0,
        Incomplete: sts.tuple(() => [Weight, XcmErrorV0]),
    }
})

export const XcmErrorV0: sts.Type<XcmErrorV0> = sts.closedEnum(() => {
    return  {
        AssetNotFound: sts.unit(),
        BadOrigin: sts.unit(),
        Barrier: sts.unit(),
        CannotReachDestination: sts.tuple(() => [MultiLocation, sts.array(() => InstructionV2)]),
        DestinationBufferOverflow: sts.unit(),
        EscalationOfPrivilege: sts.unit(),
        ExceedsMaxMessageSize: sts.unit(),
        FailedToDecode: sts.unit(),
        FailedToTransactAsset: sts.unit(),
        LocationCannotHold: sts.unit(),
        MultiLocationFull: sts.unit(),
        NotHoldingFees: sts.unit(),
        NotWithdrawable: sts.unit(),
        Overflow: sts.unit(),
        RecursionLimitReached: sts.unit(),
        SendFailed: sts.unit(),
        TooExpensive: sts.unit(),
        TooMuchWeightRequired: sts.unit(),
        Undefined: sts.unit(),
        UnhandledEffect: sts.unit(),
        UnhandledXcmMessage: sts.unit(),
        UnhandledXcmVersion: sts.unit(),
        Unimplemented: sts.unit(),
        UntrustedReserveLocation: sts.unit(),
        UntrustedTeleportLocation: sts.unit(),
        WeightLimitReached: Weight,
        WeightNotComputable: sts.unit(),
        Wildcard: sts.unit(),
    }
})

export const InstructionV2: sts.Type<InstructionV2> = sts.closedEnum(() => {
    return  {
        BuyExecution: sts.enumStruct({
            fees: MultiAssetV2,
            weightLimit: WeightLimitV2,
        }),
        ClaimAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            ticket: MultiLocationV2,
        }),
        ClearError: sts.unit(),
        ClearOrigin: sts.unit(),
        DepositAsset: sts.enumStruct({
            assets: MultiAssetFilterV2,
            maxAssets: sts.number(),
            beneficiary: MultiLocationV2,
        }),
        DepositReserveAsset: sts.enumStruct({
            assets: MultiAssetFilterV2,
            maxAssets: sts.number(),
            dest: MultiLocationV2,
            xcm: sts.array(() => InstructionV2),
        }),
        DescendOrigin: InteriorMultiLocation,
        ExchangeAsset: sts.enumStruct({
            give: MultiAssetFilterV2,
            receive: sts.array(() => MultiAssetV1),
        }),
        HrmpChannelAccepted: sts.enumStruct({
            recipient: sts.number(),
        }),
        HrmpChannelClosing: sts.enumStruct({
            initiator: sts.number(),
            sender: sts.number(),
            recipient: sts.number(),
        }),
        HrmpNewChannelOpenRequest: sts.enumStruct({
            sender: sts.number(),
            maxMessageSize: sts.number(),
            maxCapacity: sts.number(),
        }),
        InitiateReserveWithdraw: sts.enumStruct({
            assets: MultiAssetFilterV2,
            reserve: MultiLocationV2,
            xcm: sts.array(() => InstructionV2),
        }),
        InitiateTeleport: sts.enumStruct({
            assets: MultiAssetFilterV2,
            dest: MultiLocationV2,
            xcm: sts.array(() => InstructionV2),
        }),
        QueryHolding: sts.enumStruct({
            queryId: sts.bigint(),
            dest: MultiLocationV2,
            assets: MultiAssetFilterV2,
            maxResponseWeight: sts.bigint(),
        }),
        QueryResponse: sts.enumStruct({
            queryId: sts.bigint(),
            response: ResponseV2,
            maxWeight: sts.bigint(),
        }),
        ReceiveTeleportedAsset: sts.array(() => MultiAssetV1),
        RefundSurplus: sts.unit(),
        ReportError: sts.enumStruct({
            queryId: sts.bigint(),
            dest: MultiLocationV2,
            maxResponseWeight: sts.bigint(),
        }),
        ReserveAssetDeposited: sts.array(() => MultiAssetV1),
        SetAppendix: sts.array(() => InstructionV2),
        SetErrorHandler: sts.array(() => InstructionV2),
        Transact: sts.enumStruct({
            originType: OriginKindV2,
            requireWeightAtMost: sts.bigint(),
            call: DoubleEncodedCall,
        }),
        TransferAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            beneficiary: MultiLocationV2,
        }),
        TransferReserveAsset: sts.enumStruct({
            assets: sts.array(() => MultiAssetV1),
            dest: MultiLocationV2,
            xcm: sts.array(() => InstructionV2),
        }),
        Trap: sts.bigint(),
        WithdrawAsset: sts.array(() => MultiAssetV1),
    }
})

export const DoubleEncodedCall: sts.Type<DoubleEncodedCall> = sts.struct(() => {
    return  {
        encoded: sts.bytes(),
    }
})

export const OriginKindV2: sts.Type<OriginKindV2> = sts.closedEnum(() => {
    return  {
        Native: sts.unit(),
        SovereignAccount: sts.unit(),
        Superuser: sts.unit(),
        Xcm: sts.unit(),
    }
})

export const ResponseV2: sts.Type<ResponseV2> = sts.closedEnum(() => {
    return  {
        Assets: sts.array(() => MultiAssetV1),
        ExecutionResult: ResponseV2Result,
        Null: sts.unit(),
    }
})

export const ResponseV2Result = sts.result(() => sts.unit(), () => ResponseV2Error)

export const ResponseV2Error = sts.tuple(() => [sts.number(), XcmErrorV2])

export const XcmErrorV2: sts.Type<XcmErrorV2> = sts.closedEnum(() => {
    return  {
        AssetNotFound: sts.unit(),
        BadOrigin: sts.unit(),
        Barrier: sts.unit(),
        DestinationBufferOverflow: sts.unit(),
        DestinationUnsupported: sts.unit(),
        EscalationOfPrivilege: sts.unit(),
        ExceedsMaxMessageSize: sts.unit(),
        FailedToDecode: sts.unit(),
        FailedToTransactAsset: sts.unit(),
        InvalidLocation: sts.unit(),
        LocationCannotHold: sts.unit(),
        MultiLocationFull: sts.unit(),
        MultiLocationNotInvertible: sts.unit(),
        NotHoldingFees: sts.unit(),
        NotWithdrawable: sts.unit(),
        Overflow: sts.unit(),
        RecursionLimitReached: sts.unit(),
        TooExpensive: sts.unit(),
        TooMuchWeightRequired: sts.unit(),
        Transport: sts.unit(),
        Trap: sts.bigint(),
        Undefined: sts.unit(),
        UnhandledEffect: sts.unit(),
        UnhandledXcmMessage: sts.unit(),
        UnhandledXcmVersion: sts.unit(),
        Unimplemented: sts.unit(),
        UnknownClaim: sts.unit(),
        UnknownWeightRequired: sts.unit(),
        Unroutable: sts.unit(),
        UntrustedReserveLocation: sts.unit(),
        UntrustedTeleportLocation: sts.unit(),
        WeightLimitReached: Weight,
        WeightNotComputable: sts.unit(),
        Wildcard: sts.unit(),
    }
})

export const InteriorMultiLocation: sts.Type<InteriorMultiLocation> = sts.closedEnum(() => {
    return  {
        Here: sts.unit(),
        X1: JunctionV1,
        X2: sts.tuple(() => [JunctionV1, JunctionV1]),
        X3: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1]),
        X4: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X5: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X6: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X7: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X8: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
    }
})

export const JunctionV1: sts.Type<JunctionV1> = sts.closedEnum(() => {
    return  {
        AccountId32: sts.enumStruct({
            network: NetworkId,
            id: AccountId,
        }),
        AccountIndex64: sts.enumStruct({
            network: NetworkId,
            index: sts.bigint(),
        }),
        AccountKey20: sts.enumStruct({
            network: NetworkId,
            key: sts.bytes(),
        }),
        GeneralIndex: sts.bigint(),
        GeneralKey: sts.bytes(),
        OnlyChild: sts.unit(),
        PalletInstance: sts.number(),
        Parachain: sts.number(),
        Plurality: sts.enumStruct({
            id: BodyId,
            part: BodyPart,
        }),
    }
})

export const BodyPart: sts.Type<BodyPart> = sts.closedEnum(() => {
    return  {
        AtLeastProportion: sts.enumStruct({
            nom: sts.number(),
            denom: sts.number(),
        }),
        Fraction: sts.enumStruct({
            nom: sts.number(),
            denom: sts.number(),
        }),
        Members: sts.number(),
        MoreThanProportion: sts.enumStruct({
            nom: sts.number(),
            denom: sts.number(),
        }),
        Voice: sts.unit(),
    }
})

export const BodyId: sts.Type<BodyId> = sts.closedEnum(() => {
    return  {
        Executive: sts.unit(),
        Index: sts.number(),
        Judicial: sts.unit(),
        Legislative: sts.unit(),
        Named: sts.bytes(),
        Technical: sts.unit(),
        Unit: sts.unit(),
    }
})

export const NetworkId: sts.Type<NetworkId> = sts.closedEnum(() => {
    return  {
        Any: sts.unit(),
        Kusama: sts.unit(),
        Named: sts.bytes(),
        Polkadot: sts.unit(),
    }
})

export const MultiAssetFilterV2: sts.Type<MultiAssetFilterV2> = sts.closedEnum(() => {
    return  {
        Definite: sts.array(() => MultiAssetV1),
        Wild: WildMultiAssetV1,
    }
})

export const WildMultiAssetV1: sts.Type<WildMultiAssetV1> = sts.closedEnum(() => {
    return  {
        All: sts.unit(),
        AllOf: sts.enumStruct({
            id: XcmAssetId,
            fungibility: WildFungibilityV1,
        }),
    }
})

export const WildFungibilityV1: sts.Type<WildFungibilityV1> = sts.closedEnum(() => {
    return  {
        Fungible: sts.unit(),
        NonFungible: sts.unit(),
    }
})

export const XcmAssetId: sts.Type<XcmAssetId> = sts.closedEnum(() => {
    return  {
        Abstract: sts.bytes(),
        Concrete: MultiLocation,
    }
})

export const MultiLocationV2: sts.Type<MultiLocationV2> = sts.struct(() => {
    return  {
        parents: sts.number(),
        interior: JunctionsV1,
    }
})

export const JunctionsV1: sts.Type<JunctionsV1> = sts.closedEnum(() => {
    return  {
        Here: sts.unit(),
        X1: JunctionV1,
        X2: sts.tuple(() => [JunctionV1, JunctionV1]),
        X3: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1]),
        X4: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X5: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X6: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X7: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
        X8: sts.tuple(() => [JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1, JunctionV1]),
    }
})

export const MultiAssetV1: sts.Type<MultiAssetV1> = sts.struct(() => {
    return  {
        id: XcmAssetId,
        fungibility: FungibilityV1,
    }
})

export const FungibilityV1: sts.Type<FungibilityV1> = sts.closedEnum(() => {
    return  {
        Fungible: sts.bigint(),
        NonFungible: AssetInstanceV1,
    }
})

export const AssetInstanceV1: sts.Type<AssetInstanceV1> = sts.closedEnum(() => {
    return  {
        Array16: sts.bytes(),
        Array32: sts.bytes(),
        Array4: sts.bytes(),
        Array8: sts.bytes(),
        Blob: sts.bytes(),
        Index: sts.bigint(),
        Undefined: sts.unit(),
    }
})

export const WeightLimitV2: sts.Type<WeightLimitV2> = sts.closedEnum(() => {
    return  {
        Limited: sts.bigint(),
        Unlimited: sts.unit(),
    }
})

export const MultiAssetV2: sts.Type<MultiAssetV2> = sts.struct(() => {
    return  {
        id: XcmAssetId,
        fungibility: FungibilityV1,
    }
})

export const MultiLocation: sts.Type<MultiLocation> = sts.struct(() => {
    return  {
        parents: sts.number(),
        interior: JunctionsV1,
    }
})

export const Weight = sts.bigint()

export const Report: sts.Type<Report> = sts.struct(() => {
    return  {
        at: BlockNumber,
        by: AccountId,
        outcome: OutcomeReport,
    }
})

export const BlockNumber = sts.bigint()

export const MarketStatus: sts.Type<MarketStatus> = sts.closedEnum(() => {
    return  {
        Active: sts.unit(),
        Closed: sts.unit(),
        CollectingSubsidy: sts.unit(),
        Disputed: sts.unit(),
        InsufficientSubsidy: sts.unit(),
        Proposed: sts.unit(),
        Reported: sts.unit(),
        Resolved: sts.unit(),
        Suspended: sts.unit(),
    }
})

export const ScoringRule: sts.Type<ScoringRule> = sts.closedEnum(() => {
    return  {
        CPMM: sts.unit(),
        RikiddoSigmoidFeeMarketEma: sts.unit(),
    }
})

export const MarketPeriod: sts.Type<MarketPeriod> = sts.closedEnum(() => {
    return  {
        Block: sts.tuple(() => [BlockNumber, BlockNumber]),
        Timestamp: sts.tuple(() => [Moment, Moment]),
    }
})

export const Moment = sts.bigint()

export const MarketType: sts.Type<MarketType> = sts.closedEnum(() => {
    return  {
        Categorical: sts.number(),
        Scalar: sts.tuple(() => [sts.bigint(), sts.bigint()]),
    }
})

export const MarketCreation: sts.Type<MarketCreation> = sts.closedEnum(() => {
    return  {
        Advised: sts.unit(),
        Permissionless: sts.unit(),
    }
})

export const MarketIdOf = sts.bigint()

export const SwapEvent: sts.Type<SwapEvent> = sts.struct(() => {
    return  {
        assetAmountIn: Balance,
        assetAmountOut: Balance,
        assetBound: Balance,
        cpep: CommonPoolEventParams,
        maxPrice: Balance,
    }
})

export interface SwapEvent {
    assetAmountIn: Balance
    assetAmountOut: Balance
    assetBound: Balance
    cpep: CommonPoolEventParams
    maxPrice: Balance
}

export interface CommonPoolEventParams {
    poolId: bigint
    who: AccountId
}

export type Balance = bigint

export const PoolAssetEvent: sts.Type<PoolAssetEvent> = sts.struct(() => {
    return  {
        bound: Balance,
        cpep: CommonPoolEventParams,
        transferred: Balance,
    }
})

export interface PoolAssetEvent {
    bound: Balance
    cpep: CommonPoolEventParams
    transferred: Balance
}

export const PoolAssetsEvent: sts.Type<PoolAssetsEvent> = sts.struct(() => {
    return  {
        bounds: sts.array(() => Balance),
        cpep: CommonPoolEventParams,
        transferred: sts.array(() => Balance),
    }
})

export interface PoolAssetsEvent {
    bounds: Balance[]
    cpep: CommonPoolEventParams
    transferred: Balance[]
}

export const Pool: sts.Type<Pool> = sts.struct(() => {
    return  {
        assets: sts.array(() => Asset),
        baseAsset: sts.option(() => Asset),
        marketId: MarketId,
        poolStatus: PoolStatus,
        scoringRule: ScoringRule,
        swapFee: sts.option(() => Balance),
        totalSubsidy: sts.option(() => Balance),
        totalWeight: sts.option(() => sts.bigint()),
        weights: sts.option(() => sts.array(() => sts.tuple(() => [Asset, sts.bigint()]))),
    }
})

export const PoolStatus: sts.Type<PoolStatus> = sts.closedEnum(() => {
    return  {
        Active: sts.unit(),
        CollectingSubsidy: sts.unit(),
        Stale: sts.unit(),
    }
})

export type PoolStatus = PoolStatus_Active | PoolStatus_CollectingSubsidy | PoolStatus_Stale

export interface PoolStatus_Active {
    __kind: 'Active'
}

export interface PoolStatus_CollectingSubsidy {
    __kind: 'CollectingSubsidy'
}

export interface PoolStatus_Stale {
    __kind: 'Stale'
}

export const Asset: sts.Type<Asset> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [MarketId, CategoryIndex]),
        CombinatorialOutcome: sts.unit(),
        PoolShare: sts.bigint(),
        ScalarOutcome: sts.tuple(() => [MarketId, ScalarPosition]),
        Ztg: sts.unit(),
    }
})

export const ScalarPosition: sts.Type<ScalarPosition> = sts.closedEnum(() => {
    return  {
        Long: sts.unit(),
        Short: sts.unit(),
    }
})

export type ScalarPosition = ScalarPosition_Long | ScalarPosition_Short

export interface ScalarPosition_Long {
    __kind: 'Long'
}

export interface ScalarPosition_Short {
    __kind: 'Short'
}

export const CategoryIndex = sts.number()

export type Asset = Asset_CategoricalOutcome | Asset_CombinatorialOutcome | Asset_PoolShare | Asset_ScalarOutcome | Asset_Ztg

export interface Asset_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [MarketId, CategoryIndex]
}

export interface Asset_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface Asset_PoolShare {
    __kind: 'PoolShare'
    value: bigint
}

export interface Asset_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [MarketId, ScalarPosition]
}

export interface Asset_Ztg {
    __kind: 'Ztg'
}

export type CategoryIndex = number

export interface Pool {
    assets: Asset[]
    baseAsset?: (Asset | undefined)
    marketId: MarketId
    poolStatus: PoolStatus
    scoringRule: ScoringRule
    swapFee?: (Balance | undefined)
    totalSubsidy?: (Balance | undefined)
    totalWeight?: (bigint | undefined)
    weights?: ([Asset, bigint][] | undefined)
}

export const CommonPoolEventParams: sts.Type<CommonPoolEventParams> = sts.struct(() => {
    return  {
        poolId: sts.bigint(),
        who: AccountId,
    }
})

export const CurrencyId: sts.Type<CurrencyId> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [MarketId, CategoryIndex]),
        CombinatorialOutcome: sts.unit(),
        PoolShare: sts.bigint(),
        ScalarOutcome: sts.tuple(() => [MarketId, ScalarPosition]),
        Ztg: sts.unit(),
    }
})

export type CurrencyId = CurrencyId_CategoricalOutcome | CurrencyId_CombinatorialOutcome | CurrencyId_PoolShare | CurrencyId_ScalarOutcome | CurrencyId_Ztg

export interface CurrencyId_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [MarketId, CategoryIndex]
}

export interface CurrencyId_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface CurrencyId_PoolShare {
    __kind: 'PoolShare'
    value: bigint
}

export interface CurrencyId_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [MarketId, ScalarPosition]
}

export interface CurrencyId_Ztg {
    __kind: 'Ztg'
}

export const Currency: sts.Type<Currency> = sts.closedEnum(() => {
    return  {
        CategoricalOutcome: sts.tuple(() => [MarketId, CategoryIndex]),
        CombinatorialOutcome: sts.unit(),
        PoolShare: sts.bigint(),
        ScalarOutcome: sts.tuple(() => [MarketId, ScalarPosition]),
        Ztg: sts.unit(),
    }
})

export type Currency = Currency_CategoricalOutcome | Currency_CombinatorialOutcome | Currency_PoolShare | Currency_ScalarOutcome | Currency_Ztg

export interface Currency_CategoricalOutcome {
    __kind: 'CategoricalOutcome'
    value: [MarketId, CategoryIndex]
}

export interface Currency_CombinatorialOutcome {
    __kind: 'CombinatorialOutcome'
}

export interface Currency_PoolShare {
    __kind: 'PoolShare'
    value: bigint
}

export interface Currency_ScalarOutcome {
    __kind: 'ScalarOutcome'
    value: [MarketId, ScalarPosition]
}

export interface Currency_Ztg {
    __kind: 'Ztg'
}

export const BalanceStatus: sts.Type<BalanceStatus> = sts.closedEnum(() => {
    return  {
        Free: sts.unit(),
        Reserved: sts.unit(),
    }
})

export type BalanceStatus = BalanceStatus_Free | BalanceStatus_Reserved

export interface BalanceStatus_Free {
    __kind: 'Free'
}

export interface BalanceStatus_Reserved {
    __kind: 'Reserved'
}

export const Balance = sts.bigint()

export const AccountId = sts.bytes()

export const DispatchError: sts.Type<DispatchError> = sts.closedEnum(() => {
    return  {
        Arithmetic: ArithmeticError,
        BadOrigin: sts.unit(),
        CannotLookup: sts.unit(),
        ConsumerRemaining: sts.unit(),
        Module: DispatchErrorModule,
        NoProviders: sts.unit(),
        Other: sts.unit(),
        Token: TokenError,
    }
})

export const TokenError: sts.Type<TokenError> = sts.closedEnum(() => {
    return  {
        BelowMinimum: sts.unit(),
        CannotCreate: sts.unit(),
        Frozen: sts.unit(),
        NoFunds: sts.unit(),
        Overflow: sts.unit(),
        Underflow: sts.unit(),
        UnknownAsset: sts.unit(),
        WouldDie: sts.unit(),
    }
})

export type TokenError = TokenError_BelowMinimum | TokenError_CannotCreate | TokenError_Frozen | TokenError_NoFunds | TokenError_Overflow | TokenError_Underflow | TokenError_UnknownAsset | TokenError_WouldDie

export interface TokenError_BelowMinimum {
    __kind: 'BelowMinimum'
}

export interface TokenError_CannotCreate {
    __kind: 'CannotCreate'
}

export interface TokenError_Frozen {
    __kind: 'Frozen'
}

export interface TokenError_NoFunds {
    __kind: 'NoFunds'
}

export interface TokenError_Overflow {
    __kind: 'Overflow'
}

export interface TokenError_Underflow {
    __kind: 'Underflow'
}

export interface TokenError_UnknownAsset {
    __kind: 'UnknownAsset'
}

export interface TokenError_WouldDie {
    __kind: 'WouldDie'
}

export const DispatchErrorModule: sts.Type<DispatchErrorModule> = sts.struct(() => {
    return  {
        index: sts.number(),
        error: sts.number(),
    }
})

export interface DispatchErrorModule {
    index: number
    error: number
}

export const ArithmeticError: sts.Type<ArithmeticError> = sts.closedEnum(() => {
    return  {
        DivisionByZero: sts.unit(),
        Overflow: sts.unit(),
        Underflow: sts.unit(),
    }
})

export type ArithmeticError = ArithmeticError_DivisionByZero | ArithmeticError_Overflow | ArithmeticError_Underflow

export interface ArithmeticError_DivisionByZero {
    __kind: 'DivisionByZero'
}

export interface ArithmeticError_Overflow {
    __kind: 'Overflow'
}

export interface ArithmeticError_Underflow {
    __kind: 'Underflow'
}

export type DispatchError = DispatchError_Arithmetic | DispatchError_BadOrigin | DispatchError_CannotLookup | DispatchError_ConsumerRemaining | DispatchError_Module | DispatchError_NoProviders | DispatchError_Other | DispatchError_Token

export interface DispatchError_Arithmetic {
    __kind: 'Arithmetic'
    value: ArithmeticError
}

export interface DispatchError_BadOrigin {
    __kind: 'BadOrigin'
}

export interface DispatchError_CannotLookup {
    __kind: 'CannotLookup'
}

export interface DispatchError_ConsumerRemaining {
    __kind: 'ConsumerRemaining'
}

export interface DispatchError_Module {
    __kind: 'Module'
    value: DispatchErrorModule
}

export interface DispatchError_NoProviders {
    __kind: 'NoProviders'
}

export interface DispatchError_Other {
    __kind: 'Other'
}

export interface DispatchError_Token {
    __kind: 'Token'
    value: TokenError
}

export const DispatchInfo: sts.Type<DispatchInfo> = sts.struct(() => {
    return  {
        weight: Weight,
        class: DispatchClass,
        paysFee: Pays,
    }
})

export const Pays: sts.Type<Pays> = sts.closedEnum(() => {
    return  {
        No: sts.unit(),
        Yes: sts.unit(),
    }
})

export type Pays = Pays_No | Pays_Yes

export interface Pays_No {
    __kind: 'No'
}

export interface Pays_Yes {
    __kind: 'Yes'
}

export const DispatchClass: sts.Type<DispatchClass> = sts.closedEnum(() => {
    return  {
        Mandatory: sts.unit(),
        Normal: sts.unit(),
        Operational: sts.unit(),
    }
})

export type DispatchClass = DispatchClass_Mandatory | DispatchClass_Normal | DispatchClass_Operational

export interface DispatchClass_Mandatory {
    __kind: 'Mandatory'
}

export interface DispatchClass_Normal {
    __kind: 'Normal'
}

export interface DispatchClass_Operational {
    __kind: 'Operational'
}

export interface DispatchInfo {
    weight: Weight
    class: DispatchClass
    paysFee: Pays
}
