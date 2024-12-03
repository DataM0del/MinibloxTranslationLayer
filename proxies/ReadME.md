# Proxies

> [!IMPORTANT]
> This is **optional** and **disabled** by default.

You can **optionally** proxy your requests to Miniblox through a proxy server.
This is useful if:

- You're **IP banned**
- You **don't want to** use a VPN for everything else other than the connection to Miniblox
  (e.g. you're streaming, and the VPN makes it very slow or laggy)
- **Your VPN provider is blocked** by Miniblox.

## I don't have any proxies

> [!TIP]
> Again, **using a proxy is optional**.

If you don't have any proxies, consider these options:

- You can use a proxy list like
  [this one](https://github.com/proxifly/free-proxy-list) (or other similar ones)
  to get a list of proxies to use.
- You can reverse engineer a random "VPN" / proxy provider
  which has a free plan & a browser extension
  (e.g. Urban VPN ([I reverse engineered it already, find something else](https://codeberg.org/RealPacket/UrbanVPNServerDetails)))

## How do I use this?

You can use **any proxy server** that is using a protocol supported by `proxy-agent`.

From their ReadME:

[http-proxy-agent]: https://www.npmjs.com/package/http-proxy-agent
[https-proxy-agent]: https://www.npmjs.com/package/https-proxy-agent
[socks-proxy-agent]: https://www.npmjs.com/package/socks-proxy-agent
[pac-proxy-agent]: https://www.npmjs.com/package/pac-proxy-agent

| Protocol   | Proxy Agent for `http` requests | Proxy Agent for `https` requests | Example
|:----------:|:-------------------------------:|:--------------------------------:|:--------:
| `http`     | [http-proxy-agent]            | [https-proxy-agent]            | `http://proxy-server-over-tcp.com:3128`
| `https`    | [http-proxy-agent]            | [https-proxy-agent]            | `https://proxy-server-over-tls.com:3129`
| `socks(v5)`| [socks-proxy-agent]           | [socks-proxy-agent]            | `socks://username:password@some-socks-proxy.com:9050` (username & password are optional)
| `socks5`   | [socks-proxy-agent]           | [socks-proxy-agent]            | `socks5://username:password@some-socks-proxy.com:9050` (username & password are optional)
| `socks4`   | [socks-proxy-agent]           | [socks-proxy-agent]            | `socks4://some-socks-proxy.com:9050`
| `pac-*`    | [pac-proxy-agent]             | [pac-proxy-agent]              | `pac+http://www.example.com/proxy.pac`

## What did you use add this functionality?

You can look at the code to find out how it does this, but, here's a quick summary:

- ChatGPT: <https://chatgpt.com/share/6747e649-d0a4-8005-a99a-593721dfdc69>
- [`proxy-agent`](https://www.npmjs.com/package/proxy-agent)
