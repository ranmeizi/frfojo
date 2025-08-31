type GoogleQuery = {
  /**
   * 必填
   * 应用的客户端 ID。您可以在 中找到此值。
   */
  client_id: string;
  /**
   * 必填
   *
   * 确定 API 服务器在用户完成授权流程后将用户重定向到何处。
   * 此值必须与 OAuth 2.0 客户端的某个已获授权的重定向 URI 完全匹配，该 URI 是在客户端的 中配置的。
   * 如果此值与所提供 client_id 的授权重定向 URI 不匹配，您会收到 redirect_uri_mismatch 错误。
   * 请注意，http 或 https 架构、大小写和尾部斜线 (/) 都必须匹配。
   */
  redirect_uri: string;
  /**
   * 必填
   *
   * JavaScript 应用需要将该参数的值设置为 token。此值会指示 Google 授权服务器在用户完成授权
   * 流程后重定向到的 URI (#) 的 fragment 标识符中，以 name=value 对的形式返回访问令牌。
   */
  response_type: "code" | "token";
  /**
   * 必填
   *
   * 以空格分隔的范围列表，用于标识您的应用可以代表用户访问的资源。这些值用于填充 Google 向用户显示的意见征求页面。
   *
   * 有了这一范围，您不但可以让应用仅请求访问所需的资源，而且还可以让用户控制其向您的应用授予的访问权限大小。因此，请求的范围数量与获得用户同意的可能性之间存在反比关系。
   *
   * 我们建议您的应用尽可能在上下文中请求访问授权范围。通过渐进式授权请求在上下文中访问用户数据，您可以帮助用户更轻松地了解您的应用为何需要请求的访问权限。
   */
  scope: string;
  /**
   * 推荐
   *
   * 指定应用用于在授权请求和授权服务器响应之间维护状态的任何字符串值。 在用户同意或拒绝应用的访问请求后，服务器会返回您在 redirect_uri 的网址片段标识符 (#) 中作为 name=value 对发送的确切值。
   * 您可以将此参数用于多种用途，例如将用户定向到应用中的正确资源、发送 Nonce 以及减少跨网站请求伪造。由于 redirect_uri 可能会被猜到，因此使用 state 值可以提高您对传入连接是身份验证请求结果的信心。如果您生成随机字符串或对 Cookie 或捕获客户端状态的其他值进行编码，则可以验证响应，以进一步确保请求和响应来自同一浏览器，从而防范跨网站请求伪造等攻击。如需查看有关如何创建和确认 state 令牌的示例，请参阅 OpenID Connect 文档。
   */
  state?: string;
  /**
   * 可选
   *
   * 让应用能够使用增量授权来请求在上下文中访问其他作用域。如果您将此参数的值设置为 true 且授权请求获得批准，则新访问令牌还将涵盖用户之前向应用授予访问权限的所有范围。如需查看示例，请参阅增量授权部分。
   */
  include_granted_scopes?: string;
  /**
   * 可选
   *
   * 默认为 true。如果设置为 false，系统会为 2019 年之前创建的 OAuth 客户端 ID 停用更精细的 Google 账号权限。对较新的 OAuth 客户端 ID 没有影响，因为系统始终为其启用更精细的权限。
   * 当 Google 为应用启用精细权限时，此参数将不再有任何影响。
   */
  enable_granular_consent?: boolean;
  /**
   * 可选
   *
   * 如果您的应用知道哪位用户正在尝试进行身份验证，则可以使用此参数向 Google 身份验证服务器提供提示。服务器会使用提示来简化登录流程，方法是预填充登录表单中的电子邮件地址字段，或选择适当的多账号登录会话。
   * 将参数值设置为电子邮件地址或 sub 标识符，这相当于用户的 Google ID。
   */
  login_hint?: string;
  /**
   * 可选
   *
   * 以空格分隔且区分大小写的提示列表，供向用户显示。如果您未指定此参数，则系统仅会在您的项目首次请求访问权限时向用户显示提示。如需了解详情，请参阅 提示用户重新同意。
   */
  prompt?: "none" | "consent" | "select_account";
};

const scopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export function getUrl() {
  // 这里可能之后要和后段交互一下，但现在不用
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  const gQuery: GoogleQuery = {
    client_id:
      "828770627618-e5st0lf7irieu7iubktuphtktnk07qbr.apps.googleusercontent.com",
    redirect_uri: `${location.origin}/google-callback`,
    response_type: "code",
    scope: scopes.join(" "),
    include_granted_scopes: "true",
    state: "pass-through value",
    prompt: "select_account",
  };

  for (const [k, v] of Object.entries(gQuery)) {
    url.searchParams.append(k, v as string);
  }

  return url.toString();
}
