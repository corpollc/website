const API = 'https://api.corpo.llc/api/v1/dao-ownership';
const ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const NETWORKS = new Set(['mainnet-beta', 'devnet', 'testnet']);

export function tokenAmount(value, decimals) {
  if (!/^[0-9]{1,80}$/.test(value) || !Number.isInteger(decimals) || decimals < 0 || decimals > 255) throw new Error('Invalid token amount');
  const digits = BigInt(value).toString().padStart(decimals + 1, '0');
  const whole = decimals ? digits.slice(0, -decimals) : digits;
  const fraction = decimals ? digits.slice(-decimals).replace(/0+$/, '') : '';
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (fraction ? `.${fraction}` : '');
}

export function holderLabel(holder) {
  if (holder.status === 'verified_person' && ['direct', 'through_corpo'].includes(holder.verification_scope)) {
    return { label: 'Verified person', throughCorpo: holder.verification_scope === 'through_corpo', verified: true };
  }
  return { label: 'Unknown', throughCorpo: false, verified: false };
}

function summary(value) {
  if (!value || typeof value.id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(value.id)
      || typeof value.name !== 'string' || !value.name.trim() || value.name.length > 300
      || !ADDRESS.test(value.mint) || !NETWORKS.has(value.network)) throw new Error('Invalid ownership record');
  return value;
}

export function ownershipRecord(value, now = Date.now()) {
  summary(value);
  const observed = typeof value.observed_at === 'string' ? Date.parse(value.observed_at) : NaN;
  const expires = typeof value.cache_expires_at === 'string' ? Date.parse(value.cache_expires_at) : NaN;
  if (value.holdings_scope !== 'token_account_owners' || !Array.isArray(value.holders)
      || !Number.isFinite(observed) || !Number.isFinite(expires) || observed > now + 300000
      || expires <= now || expires <= observed || expires - observed > 86400000
      || typeof value.slot !== 'string' || !/^[0-9]{1,20}$/.test(value.slot) || BigInt(value.slot) <= 0n
      || !Number.isInteger(value.decimals) || value.decimals < 0 || value.decimals > 255) throw new Error('Ownership information needs a fresh check');
  const seen = new Set();
  for (const holder of value.holders) {
    if (!holder || typeof holder.address !== 'string' || !ADDRESS.test(holder.address) || seen.has(holder.address)
        || typeof holder.amount_base_units !== 'string' || !/^[0-9]{1,80}$/.test(holder.amount_base_units)
        || BigInt(holder.amount_base_units) <= 0n) throw new Error('Invalid holder record');
    seen.add(holder.address);
    tokenAmount(holder.amount_base_units, value.decimals);
  }
  return value;
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function recordURL(id) {
  const url = new URL('/dao-ownership.html', window.location.origin);
  url.searchParams.set('id', id);
  return url;
}

function explorer(type, address, network) {
  const url = new URL(`https://explorer.solana.com/${type}/${encodeURIComponent(address)}`);
  if (network !== 'mainnet-beta') url.searchParams.set('cluster', network);
  return url.href;
}

function externalLink(label, href) {
  const link = element('a', label);
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

export function mountLookup() {
  const form = document.querySelector('#ownership-search');
  const input = document.querySelector('#dao-name');
  const status = document.querySelector('#lookup-status');
  const result = document.querySelector('#lookup-result');
  let active = null;
  let generation = 0;
  let retry = null;

  function announce(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  async function request(url, signal) {
    const response = await fetch(url, { signal, credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/json' } });
    if (!response.ok) {
      const error = new Error(response.status === 404 ? 'No published ownership record was found.'
        : response.status === 400 ? 'Enter a complete Wyoming DAO name.'
        : 'Ownership information is unavailable right now. Please try again.');
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  function showRecord(record) {
    input.value = record.name;
    document.title = `${record.name} — DAO ownership — corpo`;
    const article = element('article', undefined, 'ownership-record');
    const title = element('h2', record.name);
    article.append(title);
    const metadata = element('div', undefined, 'ownership-meta');
    const date = element('time', `Last checked ${new Date(record.observed_at).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')}`);
    date.dateTime = record.observed_at;
    metadata.append(date, element('span', record.network === 'mainnet-beta' ? 'Solana mainnet' : `Solana ${record.network}`));
    article.append(metadata);

    if (record.holders.length) {
      const table = element('table', undefined, 'ownership-table');
      const caption = element('caption', 'Observed token balances');
      const head = element('thead');
      const heading = element('tr');
      for (const label of ['Holder address', 'Status']) {
        const th = element('th', label); th.scope = 'col'; heading.append(th);
      }
      head.append(heading);
      const body = element('tbody');
      for (const holder of record.holders) {
        const row = element('tr');
        const address = element('td');
        const addressLink = externalLink('', explorer('address', holder.address, record.network));
        addressLink.append(element('code', holder.address));
        address.append(addressLink, element('small', `${tokenAmount(holder.amount_base_units, record.decimals)} tokens`));
        const label = holderLabel(holder);
        const verification = element('td');
        verification.append(element('span', label.label, label.verified ? 'ownership-verified' : undefined));
        if (label.throughCorpo) verification.append(element('small', 'through Corpo'));
        row.append(address, verification); body.append(row);
      }
      table.append(caption, head, body); article.append(table);
    } else {
      article.append(element('p', 'No positive token balances were found at the time of this check.'));
    }
    article.append(element('p', 'Pooled holdings appear under their custody address.', 'ownership-note'));
    const links = element('div', undefined, 'ownership-record-links');
    const share = element('a', 'Link to this record'); share.href = recordURL(record.id).href;
    const copy = element('button', 'Copy link', 'ownership-share'); copy.type = 'button';
    copy.addEventListener('click', async () => {
      const mine = generation;
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(share.href);
        if (mine === generation) announce('Record link copied.');
      } catch {
        if (mine === generation) announce('Use “Link to this record” to copy or share the address.');
      }
    });
    links.append(share, copy, externalLink('View token on Solana ↗', explorer('address', record.mint, record.network)), element('span', `Slot ${record.slot}`));
    article.append(links); result.replaceChildren(article);
    announce(`${record.holders.length} holder ${record.holders.length === 1 ? 'address' : 'addresses'} found.`);
  }

  async function lookup({ id, name }, updateHistory = true) {
    active?.abort();
    active = new AbortController();
    const signal = active.signal;
    const mine = ++generation;
    retry = () => lookup({ id, name }, false);
    result.replaceChildren(); result.setAttribute('aria-busy', 'true');
    announce(id ? 'Checking ownership…' : 'Looking up company…');
    document.title = 'corpo — DAO ownership lookup';
    if (updateHistory) {
      const url = new URL('/dao-ownership.html', window.location.origin);
      url.searchParams.set(id ? 'id' : 'name', id || name);
      history.pushState(null, '', url);
    }
    try {
      if (id && !/^[A-Za-z0-9_-]{1,128}$/.test(id)) {
        const error = new Error('No published ownership record was found.'); error.status = 404; throw error;
      }
      if (!id) {
        const url = new URL(API); url.searchParams.set('name', name);
        const matches = await request(url, signal);
        if (mine !== generation) return;
        if (!matches || !Array.isArray(matches.results)) throw new Error('Invalid search response');
        const rows = matches.results.map(summary);
        if (!rows.length) {
          announce('No published ownership record found for that name. Check the company name and try again.');
          return;
        }
        if (rows.length > 1) {
          announce(`${rows.length} matching records. Choose your company.`);
          const section = element('div', undefined, 'ownership-matches');
          section.append(element('h2', 'Choose a company'));
          const list = element('ul', undefined, 'ownership-match-list');
          for (const row of rows) {
            const item = element('li');
            const link = element('a', row.name); link.href = recordURL(row.id).href;
            link.addEventListener('click', event => {
              if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
              event.preventDefault(); lookup({ id: row.id });
            });
            item.append(link, element('small', `${row.network} · Mint ${row.mint}`)); list.append(item);
          }
          section.append(list); result.replaceChildren(section); return;
        }
        id = rows[0].id;
      }
      const record = ownershipRecord(await request(`${API}/${encodeURIComponent(id)}`, signal));
      if (mine !== generation) return;
      if (record.id !== id) throw new Error('Unexpected ownership record');
      history.replaceState(null, '', recordURL(id));
      showRecord(record);
    } catch (error) {
      if (mine !== generation || signal.aborted) return;
      result.replaceChildren();
      announce(error.status ? error.message : 'Ownership information is unavailable right now. Please try again.', error.status !== 404);
      if (error.status !== 404 && error.status !== 400) {
        const button = element('button', 'Try again', 'ownership-share'); button.type = 'button';
        button.addEventListener('click', () => retry?.()); result.append(button);
      }
    } finally {
      if (mine === generation) result.setAttribute('aria-busy', 'false');
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = input.value.trim();
    input.setCustomValidity(name ? '' : 'Enter a Wyoming DAO name.');
    if (!form.reportValidity()) return;
    lookup({ name });
  });
  input.addEventListener('input', () => input.setCustomValidity(''));
  function navigate() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); const name = params.get('name');
    if (id || name?.trim()) {
      if (name) input.value = name;
      lookup(id ? { id } : { name: name.trim() }, false);
    } else {
      active?.abort(); generation++; input.value = ''; result.replaceChildren();
      result.setAttribute('aria-busy', 'false'); announce('');
      document.title = 'corpo — DAO ownership lookup';
    }
  }
  window.addEventListener('popstate', navigate);
  navigate();
}

if (typeof document !== 'undefined') mountLookup();
