/* 한을 홈페이지 · Supabase 연결
 * url: Supabase 프로젝트 URL, key: anon(public) 키만 넣습니다. service_role 키는 절대 넣지 마세요.
 */
window.HANUL_SB = { url: '', key: '' };

(function () {
  function configured() { var c = window.HANUL_SB || {}; return !!(c.url && c.key); }
  async function insert(table, row) {
    if (!configured()) return { ok: false, reason: 'config' };
    var c = window.HANUL_SB;
    try {
      var r = await fetch(c.url.replace(/\/$/, '') + '/rest/v1/' + table, {
        method: 'POST',
        headers: { apikey: c.key, Authorization: 'Bearer ' + c.key, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify(row)
      });
      return { ok: r.ok, reason: r.ok ? '' : 'http ' + r.status };
    } catch (e) { return { ok: false, reason: 'network' }; }
  }
  window.hanulInsert = insert;
  var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };

  // 문의 페이지: 제휴 제안 폼
  var AREA = { festival: '지역 축제·골목상권', market: '전통시장 디지털화', education: '소상공인 AI 실습교육', other: '기타 지자체 제휴' };
  if (document.getElementById('partner-form')) {
    window.handlePartnerSubmit = async function (e) {
      e.preventDefault();
      var form = document.getElementById('partner-form');
      var banner = document.getElementById('form-success-banner');
      var btn = form.querySelector('button[type=submit]');
      var area = (form.querySelector('input[name=collab_type]:checked') || {}).value || 'other';
      if (btn) btn.disabled = true;
      var res = await insert('partner_inquiries', {
        org: val('org-name'), name: val('rep-name'), phone: val('rep-phone'), email: val('rep-email'),
        area: AREA[area] || AREA.other, message: val('proposal-desc'), agreed: true
      });
      if (btn) btn.disabled = false;
      if (!banner) return;
      if (!res.ok) {
        var t = banner.querySelectorAll('p,span,div');
        banner.innerHTML = '<span class="material-symbols-outlined">info</span><div><p class="font-bold">온라인 접수를 하지 못했습니다</p><p class="text-sm">작성하신 내용을 partner@han-eul.com 으로 보내주시면 24시간 안에 회신드립니다.</p></div>';
      } else {
        form.reset();
      }
      banner.classList.remove('hidden');
      banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
  }

  // 딸깍이 페이지: 체험 로그
  var gen = document.getElementById('trigger-generate-btn');
  if (gen) {
    gen.addEventListener('click', function () {
      var cat = document.querySelector('[aria-pressed="true"], .category-btn.active, [data-selected="true"]');
      insert('demo_logs', { store: val('live-store-input').slice(0, 100), category: null });
    });
  }
})();
