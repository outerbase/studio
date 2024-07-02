// We are modularizing this manually because the current modularize setting in Emscripten has some issues:
// https://github.com/kripken/emscripten/issues/5820
// In addition, When you use emcc's modularization, it still expects to export a global object called `Module`,
// which is able to be used/called before the WASM is loaded.
// The modularization below exports a promise that loads and resolves to the actual sql.js module.
// That way, this module can't be used before the WASM is finished loading.

// We are going to define a function that a user will call to start loading initializing our Sql.js library
// However, that function might be called multiple times, and on subsequent calls, we don't actually want it to instantiate a new instance of the Module
// Instead, we want to return the previously loaded module

// TODO: Make this not declare a global if used in the browser
var initSqlJsPromise = undefined;

var initSqlJs = function (moduleConfig) {
  if (initSqlJsPromise) {
    return initSqlJsPromise;
  }
  // If we're here, we've never called this function before
  initSqlJsPromise = new Promise(function (resolveModule, reject) {
    // We are modularizing this manually because the current modularize setting in Emscripten has some issues:
    // https://github.com/kripken/emscripten/issues/5820

    // The way to affect the loading of emcc compiled modules is to create a variable called `Module` and add
    // properties to it, like `preRun`, `postRun`, etc
    // We are using that to get notified when the WASM has finished loading.
    // Only then will we return our promise

    // If they passed in a moduleConfig object, use that
    // Otherwise, initialize Module to the empty object
    var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};

    // EMCC only allows for a single onAbort function (not an array of functions)
    // So if the user defined their own onAbort function, we remember it and call it
    var originalOnAbortFunction = Module["onAbort"];
    Module["onAbort"] = function (errorThatCausedAbort) {
      reject(new Error(errorThatCausedAbort));
      if (originalOnAbortFunction) {
        originalOnAbortFunction(errorThatCausedAbort);
      }
    };

    Module["postRun"] = Module["postRun"] || [];
    Module["postRun"].push(function () {
      // When Emscripted calls postRun, this promise resolves with the built Module
      resolveModule(Module);
    });

    // There is a section of code in the emcc-generated code below that looks like this:
    // (Note that this is lowercase `module`)
    // if (typeof module !== 'undefined') {
    //     module['exports'] = Module;
    // }
    // When that runs, it's going to overwrite our own modularization export efforts in shell-post.js!
    // The only way to tell emcc not to emit it is to pass the MODULARIZE=1 or MODULARIZE_INSTANCE=1 flags,
    // but that carries with it additional unnecessary baggage/bugs we don't want either.
    // So, we have three options:
    // 1) We undefine `module`
    // 2) We remember what `module['exports']` was at the beginning of this function and we restore it later
    // 3) We write a script to remove those lines of code as part of the Make process.
    //
    // Since those are the only lines of code that care about module, we will undefine it. It's the most straightforward
    // of the options, and has the side effect of reducing emcc's efforts to modify the module if its output were to change in the future.
    // That's a nice side effect since we're handling the modularization efforts ourselves
    module = undefined;

    // The emcc-generated code and shell-post.js code goes below,
    // meaning that all of it runs inside of this promise. If anything throws an exception, our promise will abort

    var e;
    e || (e = typeof Module !== "undefined" ? Module : {});
    null;
    e.onRuntimeInitialized = function () {
      function a(g, m) {
        switch (typeof m) {
          case "boolean":
            nc(g, m ? 1 : 0);
            break;
          case "number":
            oc(g, m);
            break;
          case "string":
            pc(g, m, -1, -1);
            break;
          case "object":
            if (null === m) pb(g);
            else if (null != m.length) {
              var p = ba(m, ca);
              qc(g, p, m.length, -1);
              da(p);
            } else
              Aa(
                g,
                "Wrong API use : tried to return a value of an unknown type (" +
                  m +
                  ").",
                -1
              );
            break;
          default:
            pb(g);
        }
      }
      function b(g, m) {
        for (var p = [], r = 0; r < g; r += 1) {
          var u = k(m + 4 * r, "i32"),
            x = rc(u);
          if (1 === x || 2 === x) u = sc(u);
          else if (3 === x) u = tc(u);
          else if (4 === x) {
            x = u;
            u = uc(x);
            x = vc(x);
            for (var K = new Uint8Array(u), F = 0; F < u; F += 1)
              K[F] = n[x + F];
            u = K;
          } else u = null;
          p.push(u);
        }
        return p;
      }
      function c(g, m) {
        this.Qa = g;
        this.db = m;
        this.Oa = 1;
        this.kb = [];
      }
      function d(g, m) {
        this.db = m;
        m = ea(g) + 1;
        this.cb = fa(m);
        if (null === this.cb)
          throw Error("Unable to allocate memory for the SQL string");
        t(g, y, this.cb, m);
        this.ib = this.cb;
        this.Za = this.ob = null;
      }
      function f(g) {
        this.filename = "dbfile_" + ((4294967295 * Math.random()) >>> 0);
        if (null != g) {
          var m = this.filename,
            p = m ? z("//" + m) : "/";
          m = ha(!0, !0);
          p = ja(p, ((void 0 !== m ? m : 438) & 4095) | 32768, 0);
          if (g) {
            if ("string" === typeof g) {
              for (var r = Array(g.length), u = 0, x = g.length; u < x; ++u)
                r[u] = g.charCodeAt(u);
              g = r;
            }
            ka(p, m | 146);
            r = A(p, 577);
            la(r, g, 0, g.length, 0, void 0);
            ma(r);
            ka(p, m);
          }
        }
        this.handleError(q(this.filename, h));
        this.db = k(h, "i32");
        sb(this.db);
        this.eb = {};
        this.Sa = {};
      }
      var h = B(4),
        l = e.cwrap,
        q = l("sqlite3_open", "number", ["string", "number"]),
        w = l("sqlite3_close_v2", "number", ["number"]),
        v = l("sqlite3_exec", "number", [
          "number",
          "string",
          "number",
          "number",
          "number",
        ]),
        C = l("sqlite3_changes", "number", ["number"]),
        G = l("sqlite3_prepare_v2", "number", [
          "number",
          "string",
          "number",
          "number",
          "number",
        ]),
        ia = l("sqlite3_sql", "string", ["number"]),
        wc = l("sqlite3_normalized_sql", "string", ["number"]),
        tb = l("sqlite3_prepare_v2", "number", [
          "number",
          "number",
          "number",
          "number",
          "number",
        ]),
        xc = l("sqlite3_bind_text", "number", [
          "number",
          "number",
          "number",
          "number",
          "number",
        ]),
        ub = l("sqlite3_bind_blob", "number", [
          "number",
          "number",
          "number",
          "number",
          "number",
        ]),
        yc = l("sqlite3_bind_double", "number", ["number", "number", "number"]),
        zc = l("sqlite3_bind_int", "number", ["number", "number", "number"]),
        Ac = l("sqlite3_bind_parameter_index", "number", ["number", "string"]),
        Bc = l("sqlite3_step", "number", ["number"]),
        Cc = l("sqlite3_errmsg", "string", ["number"]),
        Dc = l("sqlite3_column_count", "number", ["number"]),
        Ec = l("sqlite3_data_count", "number", ["number"]),
        Fc = l("sqlite3_column_double", "number", ["number", "number"]),
        vb = l("sqlite3_column_text", "string", ["number", "number"]),
        Gc = l("sqlite3_column_blob", "number", ["number", "number"]),
        Hc = l("sqlite3_column_bytes", "number", ["number", "number"]),
        Ic = l("sqlite3_column_type", "number", ["number", "number"]),
        Jc = l("sqlite3_column_name", "string", ["number", "number"]),
        Kc = l("sqlite3_reset", "number", ["number"]),
        Lc = l("sqlite3_clear_bindings", "number", ["number"]),
        Mc = l("sqlite3_finalize", "number", ["number"]),
        wb = l(
          "sqlite3_create_function_v2",
          "number",
          "number string number number number number number number number".split(
            " "
          )
        ),
        rc = l("sqlite3_value_type", "number", ["number"]),
        uc = l("sqlite3_value_bytes", "number", ["number"]),
        tc = l("sqlite3_value_text", "string", ["number"]),
        vc = l("sqlite3_value_blob", "number", ["number"]),
        sc = l("sqlite3_value_double", "number", ["number"]),
        oc = l("sqlite3_result_double", "", ["number", "number"]),
        pb = l("sqlite3_result_null", "", ["number"]),
        pc = l("sqlite3_result_text", "", [
          "number",
          "string",
          "number",
          "number",
        ]),
        qc = l("sqlite3_result_blob", "", [
          "number",
          "number",
          "number",
          "number",
        ]),
        nc = l("sqlite3_result_int", "", ["number", "number"]),
        Aa = l("sqlite3_result_error", "", ["number", "string", "number"]),
        xb = l("sqlite3_aggregate_context", "number", ["number", "number"]),
        sb = l("RegisterExtensionFunctions", "number", ["number"]);
      c.prototype.bind = function (g) {
        if (!this.Qa) throw "Statement closed";
        this.reset();
        return Array.isArray(g)
          ? this.Cb(g)
          : null != g && "object" === typeof g
            ? this.Db(g)
            : !0;
      };
      c.prototype.step = function () {
        if (!this.Qa) throw "Statement closed";
        this.Oa = 1;
        var g = Bc(this.Qa);
        switch (g) {
          case 100:
            return !0;
          case 101:
            return !1;
          default:
            throw this.db.handleError(g);
        }
      };
      c.prototype.yb = function (g) {
        null == g && ((g = this.Oa), (this.Oa += 1));
        return Fc(this.Qa, g);
      };
      c.prototype.Gb = function (g) {
        null == g && ((g = this.Oa), (this.Oa += 1));
        g = vb(this.Qa, g);
        if ("function" !== typeof BigInt)
          throw Error("BigInt is not supported");
        return BigInt(g);
      };
      c.prototype.Hb = function (g) {
        null == g && ((g = this.Oa), (this.Oa += 1));
        return vb(this.Qa, g);
      };
      c.prototype.getBlob = function (g) {
        null == g && ((g = this.Oa), (this.Oa += 1));
        var m = Hc(this.Qa, g);
        g = Gc(this.Qa, g);
        for (var p = new Uint8Array(m), r = 0; r < m; r += 1) p[r] = n[g + r];
        return p;
      };
      c.prototype.get = function (g, m) {
        m = m || {};
        null != g && this.bind(g) && this.step();
        g = [];
        for (var p = Ec(this.Qa), r = 0; r < p; r += 1)
          switch (Ic(this.Qa, r)) {
            case 1:
              var u = m.useBigInt ? this.Gb(r) : this.yb(r);
              g.push(u);
              break;
            case 2:
              g.push(this.yb(r));
              break;
            case 3:
              g.push(this.Hb(r));
              break;
            case 4:
              g.push(this.getBlob(r));
              break;
            default:
              g.push(null);
          }
        return g;
      };
      c.prototype.getColumnNames = function () {
        for (var g = [], m = Dc(this.Qa), p = 0; p < m; p += 1)
          g.push(Jc(this.Qa, p));
        return g;
      };
      c.prototype.getAsObject = function (g, m) {
        g = this.get(g, m);
        m = this.getColumnNames();
        for (var p = {}, r = 0; r < m.length; r += 1) p[m[r]] = g[r];
        return p;
      };
      c.prototype.getSQL = function () {
        return ia(this.Qa);
      };
      c.prototype.getNormalizedSQL = function () {
        return wc(this.Qa);
      };
      c.prototype.run = function (g) {
        null != g && this.bind(g);
        this.step();
        return this.reset();
      };
      c.prototype.tb = function (g, m) {
        null == m && ((m = this.Oa), (this.Oa += 1));
        g = na(g);
        var p = ba(g, ca);
        this.kb.push(p);
        this.db.handleError(xc(this.Qa, m, p, g.length - 1, 0));
      };
      c.prototype.Bb = function (g, m) {
        null == m && ((m = this.Oa), (this.Oa += 1));
        var p = ba(g, ca);
        this.kb.push(p);
        this.db.handleError(ub(this.Qa, m, p, g.length, 0));
      };
      c.prototype.sb = function (g, m) {
        null == m && ((m = this.Oa), (this.Oa += 1));
        this.db.handleError((g === (g | 0) ? zc : yc)(this.Qa, m, g));
      };
      c.prototype.Eb = function (g) {
        null == g && ((g = this.Oa), (this.Oa += 1));
        ub(this.Qa, g, 0, 0, 0);
      };
      c.prototype.ub = function (g, m) {
        null == m && ((m = this.Oa), (this.Oa += 1));
        switch (typeof g) {
          case "string":
            this.tb(g, m);
            return;
          case "number":
            this.sb(g, m);
            return;
          case "bigint":
            this.tb(g.toString(), m);
            return;
          case "boolean":
            this.sb(g + 0, m);
            return;
          case "object":
            if (null === g) {
              this.Eb(m);
              return;
            }
            if (null != g.length) {
              this.Bb(g, m);
              return;
            }
        }
        throw (
          "Wrong API use : tried to bind a value of an unknown type (" +
          g +
          ")."
        );
      };
      c.prototype.Db = function (g) {
        var m = this;
        Object.keys(g).forEach(function (p) {
          var r = Ac(m.Qa, p);
          0 !== r && m.ub(g[p], r);
        });
        return !0;
      };
      c.prototype.Cb = function (g) {
        for (var m = 0; m < g.length; m += 1) this.ub(g[m], m + 1);
        return !0;
      };
      c.prototype.reset = function () {
        this.freemem();
        return 0 === Lc(this.Qa) && 0 === Kc(this.Qa);
      };
      c.prototype.freemem = function () {
        for (var g; void 0 !== (g = this.kb.pop()); ) da(g);
      };
      c.prototype.free = function () {
        this.freemem();
        var g = 0 === Mc(this.Qa);
        delete this.db.eb[this.Qa];
        this.Qa = 0;
        return g;
      };
      d.prototype.next = function () {
        if (null === this.cb) return { done: !0 };
        null !== this.Za && (this.Za.free(), (this.Za = null));
        if (!this.db.db) throw (this.mb(), Error("Database closed"));
        var g = oa(),
          m = B(4);
        pa(h);
        pa(m);
        try {
          this.db.handleError(tb(this.db.db, this.ib, -1, h, m));
          this.ib = k(m, "i32");
          var p = k(h, "i32");
          if (0 === p) return this.mb(), { done: !0 };
          this.Za = new c(p, this.db);
          this.db.eb[p] = this.Za;
          return { value: this.Za, done: !1 };
        } catch (r) {
          throw ((this.ob = D(this.ib)), this.mb(), r);
        } finally {
          qa(g);
        }
      };
      d.prototype.mb = function () {
        da(this.cb);
        this.cb = null;
      };
      d.prototype.getRemainingSQL = function () {
        return null !== this.ob ? this.ob : D(this.ib);
      };
      "function" === typeof Symbol &&
        "symbol" === typeof Symbol.iterator &&
        (d.prototype[Symbol.iterator] = function () {
          return this;
        });
      f.prototype.run = function (g, m) {
        if (!this.db) throw "Database closed";
        if (m) {
          g = this.prepare(g, m);
          try {
            g.step();
          } finally {
            g.free();
          }
        } else this.handleError(v(this.db, g, 0, 0, h));
        return this;
      };
      f.prototype.exec = function (g, m, p) {
        if (!this.db) throw "Database closed";
        var r = oa(),
          u = null;
        try {
          var x = ra(g),
            K = B(4);
          for (g = []; 0 !== k(x, "i8"); ) {
            pa(h);
            pa(K);
            this.handleError(tb(this.db, x, -1, h, K));
            var F = k(h, "i32");
            x = k(K, "i32");
            if (0 !== F) {
              var E = null;
              u = new c(F, this);
              for (null != m && u.bind(m); u.step(); )
                null === E &&
                  ((E = { columns: u.getColumnNames(), values: [] }),
                  g.push(E)),
                  E.values.push(u.get(null, p));
              u.free();
            }
          }
          return g;
        } catch (M) {
          throw (u && u.free(), M);
        } finally {
          qa(r);
        }
      };
      f.prototype.each = function (g, m, p, r, u) {
        "function" === typeof m && ((r = p), (p = m), (m = void 0));
        g = this.prepare(g, m);
        try {
          for (; g.step(); ) p(g.getAsObject(null, u));
        } finally {
          g.free();
        }
        if ("function" === typeof r) return r();
      };
      f.prototype.prepare = function (g, m) {
        pa(h);
        this.handleError(G(this.db, g, -1, h, 0));
        g = k(h, "i32");
        if (0 === g) throw "Nothing to prepare";
        var p = new c(g, this);
        null != m && p.bind(m);
        return (this.eb[g] = p);
      };
      f.prototype.iterateStatements = function (g) {
        return new d(g, this);
      };
      f.prototype["export"] = function () {
        Object.values(this.eb).forEach(function (m) {
          m.free();
        });
        Object.values(this.Sa).forEach(sa);
        this.Sa = {};
        this.handleError(w(this.db));
        var g = ta(this.filename);
        this.handleError(q(this.filename, h));
        this.db = k(h, "i32");
        sb(this.db);
        return g;
      };
      f.prototype.close = function () {
        null !== this.db &&
          (Object.values(this.eb).forEach(function (g) {
            g.free();
          }),
          Object.values(this.Sa).forEach(sa),
          (this.Sa = {}),
          this.handleError(w(this.db)),
          ua("/" + this.filename),
          (this.db = null));
      };
      f.prototype.handleError = function (g) {
        if (0 === g) return null;
        g = Cc(this.db);
        throw Error(g);
      };
      f.prototype.getRowsModified = function () {
        return C(this.db);
      };
      f.prototype.create_function = function (g, m) {
        Object.prototype.hasOwnProperty.call(this.Sa, g) &&
          (sa(this.Sa[g]), delete this.Sa[g]);
        var p = va(function (r, u, x) {
          u = b(u, x);
          try {
            var K = m.apply(null, u);
          } catch (F) {
            Aa(r, F, -1);
            return;
          }
          a(r, K);
        }, "viii");
        this.Sa[g] = p;
        this.handleError(wb(this.db, g, m.length, 1, 0, p, 0, 0, 0));
        return this;
      };
      f.prototype.create_aggregate = function (g, m) {
        var p =
            m.init ||
            function () {
              return null;
            },
          r =
            m.finalize ||
            function (E) {
              return E;
            },
          u = m.step;
        if (!u) throw "An aggregate function must have a step function in " + g;
        var x = {};
        Object.hasOwnProperty.call(this.Sa, g) &&
          (sa(this.Sa[g]), delete this.Sa[g]);
        m = g + "__finalize";
        Object.hasOwnProperty.call(this.Sa, m) &&
          (sa(this.Sa[m]), delete this.Sa[m]);
        var K = va(function (E, M, Ua) {
            var aa = xb(E, 1);
            Object.hasOwnProperty.call(x, aa) || (x[aa] = p());
            M = b(M, Ua);
            M = [x[aa]].concat(M);
            try {
              x[aa] = u.apply(null, M);
            } catch (Oc) {
              delete x[aa], Aa(E, Oc, -1);
            }
          }, "viii"),
          F = va(function (E) {
            var M = xb(E, 1);
            try {
              var Ua = r(x[M]);
            } catch (aa) {
              delete x[M];
              Aa(E, aa, -1);
              return;
            }
            a(E, Ua);
            delete x[M];
          }, "vi");
        this.Sa[g] = K;
        this.Sa[m] = F;
        this.handleError(wb(this.db, g, u.length - 1, 1, 0, 0, K, F, 0));
        return this;
      };
      e.Database = f;
    };
    var wa = {},
      H;
    for (H in e) e.hasOwnProperty(H) && (wa[H] = e[H]);
    var xa = "./this.program",
      ya = "object" === typeof window,
      za = "function" === typeof importScripts,
      Ba =
        "object" === typeof process &&
        "object" === typeof process.versions &&
        "string" === typeof process.versions.node,
      I = "",
      Ca,
      Da,
      Ea,
      Fa,
      Ga;
    if (Ba)
      (I = za ? require("path").dirname(I) + "/" : __dirname + "/"),
        (Ca = function (a, b) {
          Fa || (Fa = require("fs"));
          Ga || (Ga = require("path"));
          a = Ga.normalize(a);
          return Fa.readFileSync(a, b ? null : "utf8");
        }),
        (Ea = function (a) {
          a = Ca(a, !0);
          a.buffer || (a = new Uint8Array(a));
          a.buffer || J("Assertion failed: undefined");
          return a;
        }),
        (Da = function (a, b, c) {
          Fa || (Fa = require("fs"));
          Ga || (Ga = require("path"));
          a = Ga.normalize(a);
          Fa.readFile(a, function (d, f) {
            d ? c(d) : b(f.buffer);
          });
        }),
        1 < process.argv.length && (xa = process.argv[1].replace(/\\/g, "/")),
        process.argv.slice(2),
        "undefined" !== typeof module && (module.exports = e),
        (e.inspect = function () {
          return "[Emscripten Module object]";
        });
    else if (ya || za)
      za
        ? (I = self.location.href)
        : "undefined" !== typeof document &&
          document.currentScript &&
          (I = document.currentScript.src),
        (I =
          0 !== I.indexOf("blob:")
            ? I.substr(0, I.replace(/[?#].*/, "").lastIndexOf("/") + 1)
            : ""),
        (Ca = function (a) {
          var b = new XMLHttpRequest();
          b.open("GET", a, !1);
          b.send(null);
          return b.responseText;
        }),
        za &&
          (Ea = function (a) {
            var b = new XMLHttpRequest();
            b.open("GET", a, !1);
            b.responseType = "arraybuffer";
            b.send(null);
            return new Uint8Array(b.response);
          }),
        (Da = function (a, b, c) {
          var d = new XMLHttpRequest();
          d.open("GET", a, !0);
          d.responseType = "arraybuffer";
          d.onload = function () {
            200 == d.status || (0 == d.status && d.response)
              ? b(d.response)
              : c();
          };
          d.onerror = c;
          d.send(null);
        });
    var Ha = e.print || console.log.bind(console),
      Ia = e.printErr || console.warn.bind(console);
    for (H in wa) wa.hasOwnProperty(H) && (e[H] = wa[H]);
    wa = null;
    e.thisProgram && (xa = e.thisProgram);
    var Ja = [],
      Ka;
    function va(a, b) {
      if (!Ka) {
        Ka = new WeakMap();
        for (var c = L.length, d = 0; d < 0 + c; d++) {
          var f = L.get(d);
          f && Ka.set(f, d);
        }
      }
      if (Ka.has(a)) return Ka.get(a);
      if (Ja.length) c = Ja.pop();
      else {
        try {
          L.grow(1);
        } catch (q) {
          if (!(q instanceof RangeError)) throw q;
          throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
        }
        c = L.length - 1;
      }
      try {
        L.set(c, a);
      } catch (q) {
        if (!(q instanceof TypeError)) throw q;
        if ("function" === typeof WebAssembly.Function) {
          f = { i: "i32", j: "i64", f: "f32", d: "f64" };
          var h = { parameters: [], results: "v" == b[0] ? [] : [f[b[0]]] };
          for (d = 1; d < b.length; ++d) h.parameters.push(f[b[d]]);
          b = new WebAssembly.Function(h, a);
        } else {
          f = [1, 0, 1, 96];
          h = b.slice(0, 1);
          b = b.slice(1);
          var l = { i: 127, j: 126, f: 125, d: 124 };
          f.push(b.length);
          for (d = 0; d < b.length; ++d) f.push(l[b[d]]);
          "v" == h ? f.push(0) : (f = f.concat([1, l[h]]));
          f[1] = f.length - 2;
          b = new Uint8Array(
            [0, 97, 115, 109, 1, 0, 0, 0].concat(
              f,
              [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]
            )
          );
          b = new WebAssembly.Module(b);
          b = new WebAssembly.Instance(b, { e: { f: a } }).exports.f;
        }
        L.set(c, b);
      }
      Ka.set(a, c);
      return c;
    }
    function sa(a) {
      Ka.delete(L.get(a));
      Ja.push(a);
    }
    var La;
    e.wasmBinary && (La = e.wasmBinary);
    var noExitRuntime = e.noExitRuntime || !0;
    "object" !== typeof WebAssembly && J("no native wasm support detected");
    function pa(a) {
      var b = "i32";
      "*" === b.charAt(b.length - 1) && (b = "i32");
      switch (b) {
        case "i1":
          n[a >> 0] = 0;
          break;
        case "i8":
          n[a >> 0] = 0;
          break;
        case "i16":
          Ma[a >> 1] = 0;
          break;
        case "i32":
          N[a >> 2] = 0;
          break;
        case "i64":
          O = [
            0,
            ((P = 0),
            1 <= +Math.abs(P)
              ? 0 < P
                ? (Math.min(+Math.floor(P / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          N[a >> 2] = O[0];
          N[(a + 4) >> 2] = O[1];
          break;
        case "float":
          Na[a >> 2] = 0;
          break;
        case "double":
          Oa[a >> 3] = 0;
          break;
        default:
          J("invalid type for setValue: " + b);
      }
    }
    function k(a, b) {
      b = b || "i8";
      "*" === b.charAt(b.length - 1) && (b = "i32");
      switch (b) {
        case "i1":
          return n[a >> 0];
        case "i8":
          return n[a >> 0];
        case "i16":
          return Ma[a >> 1];
        case "i32":
          return N[a >> 2];
        case "i64":
          return N[a >> 2];
        case "float":
          return Na[a >> 2];
        case "double":
          return Number(Oa[a >> 3]);
        default:
          J("invalid type for getValue: " + b);
      }
      return null;
    }
    var Pa,
      Qa = !1;
    function Ra(a) {
      var b = e["_" + a];
      b ||
        J(
          "Assertion failed: Cannot call unknown function " +
            (a + ", make sure it is exported")
        );
      return b;
    }
    function Sa(a, b, c, d) {
      var f = {
        string: function (v) {
          var C = 0;
          if (null !== v && void 0 !== v && 0 !== v) {
            var G = (v.length << 2) + 1;
            C = B(G);
            t(v, y, C, G);
          }
          return C;
        },
        array: function (v) {
          var C = B(v.length);
          n.set(v, C);
          return C;
        },
      };
      a = Ra(a);
      var h = [],
        l = 0;
      if (d)
        for (var q = 0; q < d.length; q++) {
          var w = f[c[q]];
          w ? (0 === l && (l = oa()), (h[q] = w(d[q]))) : (h[q] = d[q]);
        }
      c = a.apply(null, h);
      return (c = (function (v) {
        0 !== l && qa(l);
        return "string" === b ? D(v) : "boolean" === b ? !!v : v;
      })(c));
    }
    var ca = 0,
      Ta = 1;
    function ba(a, b) {
      b = b == Ta ? B(a.length) : fa(a.length);
      a.subarray || a.slice ? y.set(a, b) : y.set(new Uint8Array(a), b);
      return b;
    }
    var Va =
      "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
    function Wa(a, b, c) {
      var d = b + c;
      for (c = b; a[c] && !(c >= d); ) ++c;
      if (16 < c - b && a.subarray && Va) return Va.decode(a.subarray(b, c));
      for (d = ""; b < c; ) {
        var f = a[b++];
        if (f & 128) {
          var h = a[b++] & 63;
          if (192 == (f & 224)) d += String.fromCharCode(((f & 31) << 6) | h);
          else {
            var l = a[b++] & 63;
            f =
              224 == (f & 240)
                ? ((f & 15) << 12) | (h << 6) | l
                : ((f & 7) << 18) | (h << 12) | (l << 6) | (a[b++] & 63);
            65536 > f
              ? (d += String.fromCharCode(f))
              : ((f -= 65536),
                (d += String.fromCharCode(
                  55296 | (f >> 10),
                  56320 | (f & 1023)
                )));
          }
        } else d += String.fromCharCode(f);
      }
      return d;
    }
    function D(a, b) {
      return a ? Wa(y, a, b) : "";
    }
    function t(a, b, c, d) {
      if (!(0 < d)) return 0;
      var f = c;
      d = c + d - 1;
      for (var h = 0; h < a.length; ++h) {
        var l = a.charCodeAt(h);
        if (55296 <= l && 57343 >= l) {
          var q = a.charCodeAt(++h);
          l = (65536 + ((l & 1023) << 10)) | (q & 1023);
        }
        if (127 >= l) {
          if (c >= d) break;
          b[c++] = l;
        } else {
          if (2047 >= l) {
            if (c + 1 >= d) break;
            b[c++] = 192 | (l >> 6);
          } else {
            if (65535 >= l) {
              if (c + 2 >= d) break;
              b[c++] = 224 | (l >> 12);
            } else {
              if (c + 3 >= d) break;
              b[c++] = 240 | (l >> 18);
              b[c++] = 128 | ((l >> 12) & 63);
            }
            b[c++] = 128 | ((l >> 6) & 63);
          }
          b[c++] = 128 | (l & 63);
        }
      }
      b[c] = 0;
      return c - f;
    }
    function ea(a) {
      for (var b = 0, c = 0; c < a.length; ++c) {
        var d = a.charCodeAt(c);
        55296 <= d &&
          57343 >= d &&
          (d = (65536 + ((d & 1023) << 10)) | (a.charCodeAt(++c) & 1023));
        127 >= d ? ++b : (b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4);
      }
      return b;
    }
    function Xa(a) {
      var b = ea(a) + 1,
        c = fa(b);
      c && t(a, n, c, b);
      return c;
    }
    function ra(a) {
      var b = ea(a) + 1,
        c = B(b);
      t(a, n, c, b);
      return c;
    }
    var Ya, n, y, Ma, N, Na, Oa;
    function Za() {
      var a = Pa.buffer;
      Ya = a;
      e.HEAP8 = n = new Int8Array(a);
      e.HEAP16 = Ma = new Int16Array(a);
      e.HEAP32 = N = new Int32Array(a);
      e.HEAPU8 = y = new Uint8Array(a);
      e.HEAPU16 = new Uint16Array(a);
      e.HEAPU32 = new Uint32Array(a);
      e.HEAPF32 = Na = new Float32Array(a);
      e.HEAPF64 = Oa = new Float64Array(a);
    }
    var L,
      $a = [],
      ab = [],
      bb = [];
    function cb() {
      var a = e.preRun.shift();
      $a.unshift(a);
    }
    var db = 0,
      eb = null,
      fb = null;
    e.preloadedImages = {};
    e.preloadedAudios = {};
    function J(a) {
      if (e.onAbort) e.onAbort(a);
      a = "Aborted(" + a + ")";
      Ia(a);
      Qa = !0;
      throw new WebAssembly.RuntimeError(
        a + ". Build with -s ASSERTIONS=1 for more info."
      );
    }
    function gb() {
      return Q.startsWith("data:application/octet-stream;base64,");
    }
    var Q;
    Q = "sql-wasm.wasm";
    if (!gb()) {
      var hb = Q;
      Q = e.locateFile ? e.locateFile(hb, I) : I + hb;
    }
    function ib() {
      var a = Q;
      try {
        if (a == Q && La) return new Uint8Array(La);
        if (Ea) return Ea(a);
        throw "both async and sync fetching of the wasm failed";
      } catch (b) {
        J(b);
      }
    }
    function jb() {
      if (!La && (ya || za)) {
        if ("function" === typeof fetch && !Q.startsWith("file://"))
          return fetch(Q, { credentials: "same-origin" })
            .then(function (a) {
              if (!a.ok) throw "failed to load wasm binary file at '" + Q + "'";
              return a.arrayBuffer();
            })
            .catch(function () {
              return ib();
            });
        if (Da)
          return new Promise(function (a, b) {
            Da(
              Q,
              function (c) {
                a(new Uint8Array(c));
              },
              b
            );
          });
      }
      return Promise.resolve().then(function () {
        return ib();
      });
    }
    var P, O;
    function kb(a) {
      for (; 0 < a.length; ) {
        var b = a.shift();
        if ("function" == typeof b) b(e);
        else {
          var c = b.Qb;
          "number" === typeof c
            ? void 0 === b.lb
              ? L.get(c)()
              : L.get(c)(b.lb)
            : c(void 0 === b.lb ? null : b.lb);
        }
      }
    }
    function lb(a) {
      return a.replace(/\b_Z[\w\d_]+/g, function (b) {
        return b === b ? b : b + " [" + b + "]";
      });
    }
    function mb() {
      function a(l) {
        return (l = l.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? l[1] : "GMT";
      }
      var b = new Date().getFullYear(),
        c = new Date(b, 0, 1),
        d = new Date(b, 6, 1);
      b = c.getTimezoneOffset();
      var f = d.getTimezoneOffset(),
        h = Math.max(b, f);
      N[nb() >> 2] = 60 * h;
      N[ob() >> 2] = Number(b != f);
      c = a(c);
      d = a(d);
      c = Xa(c);
      d = Xa(d);
      f < b
        ? ((N[qb() >> 2] = c), (N[(qb() + 4) >> 2] = d))
        : ((N[qb() >> 2] = d), (N[(qb() + 4) >> 2] = c));
    }
    var rb;
    function yb(a, b) {
      for (var c = 0, d = a.length - 1; 0 <= d; d--) {
        var f = a[d];
        "." === f
          ? a.splice(d, 1)
          : ".." === f
            ? (a.splice(d, 1), c++)
            : c && (a.splice(d, 1), c--);
      }
      if (b) for (; c; c--) a.unshift("..");
      return a;
    }
    function z(a) {
      var b = "/" === a.charAt(0),
        c = "/" === a.substr(-1);
      (a = yb(
        a.split("/").filter(function (d) {
          return !!d;
        }),
        !b
      ).join("/")) ||
        b ||
        (a = ".");
      a && c && (a += "/");
      return (b ? "/" : "") + a;
    }
    function zb(a) {
      var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
        .exec(a)
        .slice(1);
      a = b[0];
      b = b[1];
      if (!a && !b) return ".";
      b && (b = b.substr(0, b.length - 1));
      return a + b;
    }
    function Ab(a) {
      if ("/" === a) return "/";
      a = z(a);
      a = a.replace(/\/$/, "");
      var b = a.lastIndexOf("/");
      return -1 === b ? a : a.substr(b + 1);
    }
    function Bb() {
      if (
        "object" === typeof crypto &&
        "function" === typeof crypto.getRandomValues
      ) {
        var a = new Uint8Array(1);
        return function () {
          crypto.getRandomValues(a);
          return a[0];
        };
      }
      if (Ba)
        try {
          var b = require("crypto");
          return function () {
            return b.randomBytes(1)[0];
          };
        } catch (c) {}
      return function () {
        J("randomDevice");
      };
    }
    function Cb() {
      for (var a = "", b = !1, c = arguments.length - 1; -1 <= c && !b; c--) {
        b = 0 <= c ? arguments[c] : "/";
        if ("string" !== typeof b)
          throw new TypeError("Arguments to path.resolve must be strings");
        if (!b) return "";
        a = b + "/" + a;
        b = "/" === b.charAt(0);
      }
      a = yb(
        a.split("/").filter(function (d) {
          return !!d;
        }),
        !b
      ).join("/");
      return (b ? "/" : "") + a || ".";
    }
    var Db = [];
    function Eb(a, b) {
      Db[a] = { input: [], output: [], bb: b };
      Fb(a, Gb);
    }
    var Gb = {
        open: function (a) {
          var b = Db[a.node.rdev];
          if (!b) throw new R(43);
          a.tty = b;
          a.seekable = !1;
        },
        close: function (a) {
          a.tty.bb.flush(a.tty);
        },
        flush: function (a) {
          a.tty.bb.flush(a.tty);
        },
        read: function (a, b, c, d) {
          if (!a.tty || !a.tty.bb.zb) throw new R(60);
          for (var f = 0, h = 0; h < d; h++) {
            try {
              var l = a.tty.bb.zb(a.tty);
            } catch (q) {
              throw new R(29);
            }
            if (void 0 === l && 0 === f) throw new R(6);
            if (null === l || void 0 === l) break;
            f++;
            b[c + h] = l;
          }
          f && (a.node.timestamp = Date.now());
          return f;
        },
        write: function (a, b, c, d) {
          if (!a.tty || !a.tty.bb.pb) throw new R(60);
          try {
            for (var f = 0; f < d; f++) a.tty.bb.pb(a.tty, b[c + f]);
          } catch (h) {
            throw new R(29);
          }
          d && (a.node.timestamp = Date.now());
          return f;
        },
      },
      Hb = {
        zb: function (a) {
          if (!a.input.length) {
            var b = null;
            if (Ba) {
              var c = Buffer.alloc(256),
                d = 0;
              try {
                d = Fa.readSync(process.stdin.fd, c, 0, 256, null);
              } catch (f) {
                if (f.toString().includes("EOF")) d = 0;
                else throw f;
              }
              0 < d ? (b = c.slice(0, d).toString("utf-8")) : (b = null);
            } else
              "undefined" != typeof window && "function" == typeof window.prompt
                ? ((b = window.prompt("Input: ")), null !== b && (b += "\n"))
                : "function" == typeof readline &&
                  ((b = readline()), null !== b && (b += "\n"));
            if (!b) return null;
            a.input = na(b, !0);
          }
          return a.input.shift();
        },
        pb: function (a, b) {
          null === b || 10 === b
            ? (Ha(Wa(a.output, 0)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        flush: function (a) {
          a.output &&
            0 < a.output.length &&
            (Ha(Wa(a.output, 0)), (a.output = []));
        },
      },
      Ib = {
        pb: function (a, b) {
          null === b || 10 === b
            ? (Ia(Wa(a.output, 0)), (a.output = []))
            : 0 != b && a.output.push(b);
        },
        flush: function (a) {
          a.output &&
            0 < a.output.length &&
            (Ia(Wa(a.output, 0)), (a.output = []));
        },
      };
    function Jb(a) {
      a = 65536 * Math.ceil(a / 65536);
      var b = Kb(65536, a);
      if (!b) return 0;
      y.fill(0, b, b + a);
      return b;
    }
    var S = {
        Va: null,
        Wa: function () {
          return S.createNode(null, "/", 16895, 0);
        },
        createNode: function (a, b, c, d) {
          if (24576 === (c & 61440) || 4096 === (c & 61440)) throw new R(63);
          S.Va ||
            (S.Va = {
              dir: {
                node: {
                  Ua: S.La.Ua,
                  Ta: S.La.Ta,
                  lookup: S.La.lookup,
                  fb: S.La.fb,
                  rename: S.La.rename,
                  unlink: S.La.unlink,
                  rmdir: S.La.rmdir,
                  readdir: S.La.readdir,
                  symlink: S.La.symlink,
                },
                stream: { Ya: S.Ma.Ya },
              },
              file: {
                node: { Ua: S.La.Ua, Ta: S.La.Ta },
                stream: {
                  Ya: S.Ma.Ya,
                  read: S.Ma.read,
                  write: S.Ma.write,
                  rb: S.Ma.rb,
                  gb: S.Ma.gb,
                  hb: S.Ma.hb,
                },
              },
              link: {
                node: { Ua: S.La.Ua, Ta: S.La.Ta, readlink: S.La.readlink },
                stream: {},
              },
              vb: { node: { Ua: S.La.Ua, Ta: S.La.Ta }, stream: Lb },
            });
          c = Mb(a, b, c, d);
          T(c.mode)
            ? ((c.La = S.Va.dir.node), (c.Ma = S.Va.dir.stream), (c.Na = {}))
            : 32768 === (c.mode & 61440)
              ? ((c.La = S.Va.file.node),
                (c.Ma = S.Va.file.stream),
                (c.Ra = 0),
                (c.Na = null))
              : 40960 === (c.mode & 61440)
                ? ((c.La = S.Va.link.node), (c.Ma = S.Va.link.stream))
                : 8192 === (c.mode & 61440) &&
                  ((c.La = S.Va.vb.node), (c.Ma = S.Va.vb.stream));
          c.timestamp = Date.now();
          a && ((a.Na[b] = c), (a.timestamp = c.timestamp));
          return c;
        },
        Rb: function (a) {
          return a.Na
            ? a.Na.subarray
              ? a.Na.subarray(0, a.Ra)
              : new Uint8Array(a.Na)
            : new Uint8Array(0);
        },
        wb: function (a, b) {
          var c = a.Na ? a.Na.length : 0;
          c >= b ||
            ((b = Math.max(b, (c * (1048576 > c ? 2 : 1.125)) >>> 0)),
            0 != c && (b = Math.max(b, 256)),
            (c = a.Na),
            (a.Na = new Uint8Array(b)),
            0 < a.Ra && a.Na.set(c.subarray(0, a.Ra), 0));
        },
        Nb: function (a, b) {
          if (a.Ra != b)
            if (0 == b) (a.Na = null), (a.Ra = 0);
            else {
              var c = a.Na;
              a.Na = new Uint8Array(b);
              c && a.Na.set(c.subarray(0, Math.min(b, a.Ra)));
              a.Ra = b;
            }
        },
        La: {
          Ua: function (a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            T(a.mode)
              ? (b.size = 4096)
              : 32768 === (a.mode & 61440)
                ? (b.size = a.Ra)
                : 40960 === (a.mode & 61440)
                  ? (b.size = a.link.length)
                  : (b.size = 0);
            b.atime = new Date(a.timestamp);
            b.mtime = new Date(a.timestamp);
            b.ctime = new Date(a.timestamp);
            b.Fb = 4096;
            b.blocks = Math.ceil(b.size / b.Fb);
            return b;
          },
          Ta: function (a, b) {
            void 0 !== b.mode && (a.mode = b.mode);
            void 0 !== b.timestamp && (a.timestamp = b.timestamp);
            void 0 !== b.size && S.Nb(a, b.size);
          },
          lookup: function () {
            throw Nb[44];
          },
          fb: function (a, b, c, d) {
            return S.createNode(a, b, c, d);
          },
          rename: function (a, b, c) {
            if (T(a.mode)) {
              try {
                var d = Ob(b, c);
              } catch (h) {}
              if (d) for (var f in d.Na) throw new R(55);
            }
            delete a.parent.Na[a.name];
            a.parent.timestamp = Date.now();
            a.name = c;
            b.Na[c] = a;
            b.timestamp = a.parent.timestamp;
            a.parent = b;
          },
          unlink: function (a, b) {
            delete a.Na[b];
            a.timestamp = Date.now();
          },
          rmdir: function (a, b) {
            var c = Ob(a, b),
              d;
            for (d in c.Na) throw new R(55);
            delete a.Na[b];
            a.timestamp = Date.now();
          },
          readdir: function (a) {
            var b = [".", ".."],
              c;
            for (c in a.Na) a.Na.hasOwnProperty(c) && b.push(c);
            return b;
          },
          symlink: function (a, b, c) {
            a = S.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink: function (a) {
            if (40960 !== (a.mode & 61440)) throw new R(28);
            return a.link;
          },
        },
        Ma: {
          read: function (a, b, c, d, f) {
            var h = a.node.Na;
            if (f >= a.node.Ra) return 0;
            a = Math.min(a.node.Ra - f, d);
            if (8 < a && h.subarray) b.set(h.subarray(f, f + a), c);
            else for (d = 0; d < a; d++) b[c + d] = h[f + d];
            return a;
          },
          write: function (a, b, c, d, f, h) {
            b.buffer === n.buffer && (h = !1);
            if (!d) return 0;
            a = a.node;
            a.timestamp = Date.now();
            if (b.subarray && (!a.Na || a.Na.subarray)) {
              if (h) return (a.Na = b.subarray(c, c + d)), (a.Ra = d);
              if (0 === a.Ra && 0 === f)
                return (a.Na = b.slice(c, c + d)), (a.Ra = d);
              if (f + d <= a.Ra) return a.Na.set(b.subarray(c, c + d), f), d;
            }
            S.wb(a, f + d);
            if (a.Na.subarray && b.subarray) a.Na.set(b.subarray(c, c + d), f);
            else for (h = 0; h < d; h++) a.Na[f + h] = b[c + h];
            a.Ra = Math.max(a.Ra, f + d);
            return d;
          },
          Ya: function (a, b, c) {
            1 === c
              ? (b += a.position)
              : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Ra);
            if (0 > b) throw new R(28);
            return b;
          },
          rb: function (a, b, c) {
            S.wb(a.node, b + c);
            a.node.Ra = Math.max(a.node.Ra, b + c);
          },
          gb: function (a, b, c, d, f, h) {
            if (0 !== b) throw new R(28);
            if (32768 !== (a.node.mode & 61440)) throw new R(43);
            a = a.node.Na;
            if (h & 2 || a.buffer !== Ya) {
              if (0 < d || d + c < a.length)
                a.subarray
                  ? (a = a.subarray(d, d + c))
                  : (a = Array.prototype.slice.call(a, d, d + c));
              d = !0;
              c = Jb(c);
              if (!c) throw new R(48);
              n.set(a, c);
            } else (d = !1), (c = a.byteOffset);
            return { Mb: c, jb: d };
          },
          hb: function (a, b, c, d, f) {
            if (32768 !== (a.node.mode & 61440)) throw new R(43);
            if (f & 2) return 0;
            S.Ma.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      Pb = null,
      Qb = {},
      U = [],
      Rb = 1,
      V = null,
      Sb = !0,
      R = null,
      Nb = {};
    function W(a, b) {
      a = Cb("/", a);
      b = b || {};
      if (!a) return { path: "", node: null };
      var c = { xb: !0, qb: 0 },
        d;
      for (d in c) void 0 === b[d] && (b[d] = c[d]);
      if (8 < b.qb) throw new R(32);
      a = yb(
        a.split("/").filter(function (l) {
          return !!l;
        }),
        !1
      );
      var f = Pb;
      c = "/";
      for (d = 0; d < a.length; d++) {
        var h = d === a.length - 1;
        if (h && b.parent) break;
        f = Ob(f, a[d]);
        c = z(c + "/" + a[d]);
        f.$a && (!h || (h && b.xb)) && (f = f.$a.root);
        if (!h || b.Xa)
          for (h = 0; 40960 === (f.mode & 61440); )
            if (
              ((f = Tb(c)),
              (c = Cb(zb(c), f)),
              (f = W(c, { qb: b.qb }).node),
              40 < h++)
            )
              throw new R(32);
      }
      return { path: c, node: f };
    }
    function Ub(a) {
      for (var b; ; ) {
        if (a === a.parent)
          return (
            (a = a.Wa.Ab),
            b ? ("/" !== a[a.length - 1] ? a + "/" + b : a + b) : a
          );
        b = b ? a.name + "/" + b : a.name;
        a = a.parent;
      }
    }
    function Vb(a, b) {
      for (var c = 0, d = 0; d < b.length; d++)
        c = ((c << 5) - c + b.charCodeAt(d)) | 0;
      return ((a + c) >>> 0) % V.length;
    }
    function Wb(a) {
      var b = Vb(a.parent.id, a.name);
      if (V[b] === a) V[b] = a.ab;
      else
        for (b = V[b]; b; ) {
          if (b.ab === a) {
            b.ab = a.ab;
            break;
          }
          b = b.ab;
        }
    }
    function Ob(a, b) {
      var c;
      if ((c = (c = Xb(a, "x")) ? c : a.La.lookup ? 0 : 2)) throw new R(c, a);
      for (c = V[Vb(a.id, b)]; c; c = c.ab) {
        var d = c.name;
        if (c.parent.id === a.id && d === b) return c;
      }
      return a.La.lookup(a, b);
    }
    function Mb(a, b, c, d) {
      a = new Yb(a, b, c, d);
      b = Vb(a.parent.id, a.name);
      a.ab = V[b];
      return (V[b] = a);
    }
    function T(a) {
      return 16384 === (a & 61440);
    }
    var Zb = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 };
    function $b(a) {
      var b = ["r", "w", "rw"][a & 3];
      a & 512 && (b += "w");
      return b;
    }
    function Xb(a, b) {
      if (Sb) return 0;
      if (!b.includes("r") || a.mode & 292) {
        if (
          (b.includes("w") && !(a.mode & 146)) ||
          (b.includes("x") && !(a.mode & 73))
        )
          return 2;
      } else return 2;
      return 0;
    }
    function ac(a, b) {
      try {
        return Ob(a, b), 20;
      } catch (c) {}
      return Xb(a, "wx");
    }
    function bc(a, b, c) {
      try {
        var d = Ob(a, b);
      } catch (f) {
        return f.Pa;
      }
      if ((a = Xb(a, "wx"))) return a;
      if (c) {
        if (!T(d.mode)) return 54;
        if (d === d.parent || "/" === Ub(d)) return 10;
      } else if (T(d.mode)) return 31;
      return 0;
    }
    function cc(a) {
      var b = 4096;
      for (a = a || 0; a <= b; a++) if (!U[a]) return a;
      throw new R(33);
    }
    function dc(a, b) {
      ec || ((ec = function () {}), (ec.prototype = {}));
      var c = new ec(),
        d;
      for (d in a) c[d] = a[d];
      a = c;
      b = cc(b);
      a.fd = b;
      return (U[b] = a);
    }
    var Lb = {
      open: function (a) {
        a.Ma = Qb[a.node.rdev].Ma;
        a.Ma.open && a.Ma.open(a);
      },
      Ya: function () {
        throw new R(70);
      },
    };
    function Fb(a, b) {
      Qb[a] = { Ma: b };
    }
    function fc(a, b) {
      var c = "/" === b,
        d = !b;
      if (c && Pb) throw new R(10);
      if (!c && !d) {
        var f = W(b, { xb: !1 });
        b = f.path;
        f = f.node;
        if (f.$a) throw new R(10);
        if (!T(f.mode)) throw new R(54);
      }
      b = { type: a, Sb: {}, Ab: b, Kb: [] };
      a = a.Wa(b);
      a.Wa = b;
      b.root = a;
      c ? (Pb = a) : f && ((f.$a = b), f.Wa && f.Wa.Kb.push(b));
    }
    function ja(a, b, c) {
      var d = W(a, { parent: !0 }).node;
      a = Ab(a);
      if (!a || "." === a || ".." === a) throw new R(28);
      var f = ac(d, a);
      if (f) throw new R(f);
      if (!d.La.fb) throw new R(63);
      return d.La.fb(d, a, b, c);
    }
    function X(a, b) {
      return ja(a, ((void 0 !== b ? b : 511) & 1023) | 16384, 0);
    }
    function gc(a, b, c) {
      "undefined" === typeof c && ((c = b), (b = 438));
      ja(a, b | 8192, c);
    }
    function hc(a, b) {
      if (!Cb(a)) throw new R(44);
      var c = W(b, { parent: !0 }).node;
      if (!c) throw new R(44);
      b = Ab(b);
      var d = ac(c, b);
      if (d) throw new R(d);
      if (!c.La.symlink) throw new R(63);
      c.La.symlink(c, b, a);
    }
    function ua(a) {
      var b = W(a, { parent: !0 }).node;
      a = Ab(a);
      var c = Ob(b, a),
        d = bc(b, a, !1);
      if (d) throw new R(d);
      if (!b.La.unlink) throw new R(63);
      if (c.$a) throw new R(10);
      b.La.unlink(b, a);
      Wb(c);
    }
    function Tb(a) {
      a = W(a).node;
      if (!a) throw new R(44);
      if (!a.La.readlink) throw new R(28);
      return Cb(Ub(a.parent), a.La.readlink(a));
    }
    function ic(a, b) {
      a = W(a, { Xa: !b }).node;
      if (!a) throw new R(44);
      if (!a.La.Ua) throw new R(63);
      return a.La.Ua(a);
    }
    function jc(a) {
      return ic(a, !0);
    }
    function ka(a, b) {
      a = "string" === typeof a ? W(a, { Xa: !0 }).node : a;
      if (!a.La.Ta) throw new R(63);
      a.La.Ta(a, {
        mode: (b & 4095) | (a.mode & -4096),
        timestamp: Date.now(),
      });
    }
    function kc(a) {
      a = "string" === typeof a ? W(a, { Xa: !0 }).node : a;
      if (!a.La.Ta) throw new R(63);
      a.La.Ta(a, { timestamp: Date.now() });
    }
    function lc(a, b) {
      if (0 > b) throw new R(28);
      a = "string" === typeof a ? W(a, { Xa: !0 }).node : a;
      if (!a.La.Ta) throw new R(63);
      if (T(a.mode)) throw new R(31);
      if (32768 !== (a.mode & 61440)) throw new R(28);
      var c = Xb(a, "w");
      if (c) throw new R(c);
      a.La.Ta(a, { size: b, timestamp: Date.now() });
    }
    function A(a, b, c, d) {
      if ("" === a) throw new R(44);
      if ("string" === typeof b) {
        var f = Zb[b];
        if ("undefined" === typeof f)
          throw Error("Unknown file open mode: " + b);
        b = f;
      }
      c = b & 64 ? (("undefined" === typeof c ? 438 : c) & 4095) | 32768 : 0;
      if ("object" === typeof a) var h = a;
      else {
        a = z(a);
        try {
          h = W(a, { Xa: !(b & 131072) }).node;
        } catch (l) {}
      }
      f = !1;
      if (b & 64)
        if (h) {
          if (b & 128) throw new R(20);
        } else (h = ja(a, c, 0)), (f = !0);
      if (!h) throw new R(44);
      8192 === (h.mode & 61440) && (b &= -513);
      if (b & 65536 && !T(h.mode)) throw new R(54);
      if (
        !f &&
        (c = h
          ? 40960 === (h.mode & 61440)
            ? 32
            : T(h.mode) && ("r" !== $b(b) || b & 512)
              ? 31
              : Xb(h, $b(b))
          : 44)
      )
        throw new R(c);
      b & 512 && lc(h, 0);
      b &= -131713;
      d = dc(
        {
          node: h,
          path: Ub(h),
          id: h.id,
          flags: b,
          mode: h.mode,
          seekable: !0,
          position: 0,
          Ma: h.Ma,
          La: h.La,
          Pb: [],
          error: !1,
        },
        d
      );
      d.Ma.open && d.Ma.open(d);
      !e.logReadFiles || b & 1 || (mc || (mc = {}), a in mc || (mc[a] = 1));
      return d;
    }
    function ma(a) {
      if (null === a.fd) throw new R(8);
      a.nb && (a.nb = null);
      try {
        a.Ma.close && a.Ma.close(a);
      } catch (b) {
        throw b;
      } finally {
        U[a.fd] = null;
      }
      a.fd = null;
    }
    function Nc(a, b, c) {
      if (null === a.fd) throw new R(8);
      if (!a.seekable || !a.Ma.Ya) throw new R(70);
      if (0 != c && 1 != c && 2 != c) throw new R(28);
      a.position = a.Ma.Ya(a, b, c);
      a.Pb = [];
    }
    function Pc(a, b, c, d, f) {
      if (0 > d || 0 > f) throw new R(28);
      if (null === a.fd) throw new R(8);
      if (1 === (a.flags & 2097155)) throw new R(8);
      if (T(a.node.mode)) throw new R(31);
      if (!a.Ma.read) throw new R(28);
      var h = "undefined" !== typeof f;
      if (!h) f = a.position;
      else if (!a.seekable) throw new R(70);
      b = a.Ma.read(a, b, c, d, f);
      h || (a.position += b);
      return b;
    }
    function la(a, b, c, d, f, h) {
      if (0 > d || 0 > f) throw new R(28);
      if (null === a.fd) throw new R(8);
      if (0 === (a.flags & 2097155)) throw new R(8);
      if (T(a.node.mode)) throw new R(31);
      if (!a.Ma.write) throw new R(28);
      a.seekable && a.flags & 1024 && Nc(a, 0, 2);
      var l = "undefined" !== typeof f;
      if (!l) f = a.position;
      else if (!a.seekable) throw new R(70);
      b = a.Ma.write(a, b, c, d, f, h);
      l || (a.position += b);
      return b;
    }
    function ta(a) {
      var b = { encoding: "binary" };
      b = b || {};
      b.flags = b.flags || 0;
      b.encoding = b.encoding || "binary";
      if ("utf8" !== b.encoding && "binary" !== b.encoding)
        throw Error('Invalid encoding type "' + b.encoding + '"');
      var c,
        d = A(a, b.flags);
      a = ic(a).size;
      var f = new Uint8Array(a);
      Pc(d, f, 0, a, 0);
      "utf8" === b.encoding
        ? (c = Wa(f, 0))
        : "binary" === b.encoding && (c = f);
      ma(d);
      return c;
    }
    function Qc() {
      R ||
        ((R = function (a, b) {
          this.node = b;
          this.Ob = function (c) {
            this.Pa = c;
          };
          this.Ob(a);
          this.message = "FS error";
        }),
        (R.prototype = Error()),
        (R.prototype.constructor = R),
        [44].forEach(function (a) {
          Nb[a] = new R(a);
          Nb[a].stack = "<generic error, no stack>";
        }));
    }
    var Rc;
    function ha(a, b) {
      var c = 0;
      a && (c |= 365);
      b && (c |= 146);
      return c;
    }
    function Sc(a, b, c) {
      a = z("/dev/" + a);
      var d = ha(!!b, !!c);
      Tc || (Tc = 64);
      var f = (Tc++ << 8) | 0;
      Fb(f, {
        open: function (h) {
          h.seekable = !1;
        },
        close: function () {
          c && c.buffer && c.buffer.length && c(10);
        },
        read: function (h, l, q, w) {
          for (var v = 0, C = 0; C < w; C++) {
            try {
              var G = b();
            } catch (ia) {
              throw new R(29);
            }
            if (void 0 === G && 0 === v) throw new R(6);
            if (null === G || void 0 === G) break;
            v++;
            l[q + C] = G;
          }
          v && (h.node.timestamp = Date.now());
          return v;
        },
        write: function (h, l, q, w) {
          for (var v = 0; v < w; v++)
            try {
              c(l[q + v]);
            } catch (C) {
              throw new R(29);
            }
          w && (h.node.timestamp = Date.now());
          return v;
        },
      });
      gc(a, d, f);
    }
    var Tc,
      Y = {},
      ec,
      mc,
      Uc = {};
    function Vc(a, b, c) {
      try {
        var d = a(b);
      } catch (f) {
        if (f && f.node && z(b) !== z(Ub(f.node))) return -54;
        throw f;
      }
      N[c >> 2] = d.dev;
      N[(c + 4) >> 2] = 0;
      N[(c + 8) >> 2] = d.ino;
      N[(c + 12) >> 2] = d.mode;
      N[(c + 16) >> 2] = d.nlink;
      N[(c + 20) >> 2] = d.uid;
      N[(c + 24) >> 2] = d.gid;
      N[(c + 28) >> 2] = d.rdev;
      N[(c + 32) >> 2] = 0;
      O = [
        d.size >>> 0,
        ((P = d.size),
        1 <= +Math.abs(P)
          ? 0 < P
            ? (Math.min(+Math.floor(P / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      N[(c + 40) >> 2] = O[0];
      N[(c + 44) >> 2] = O[1];
      N[(c + 48) >> 2] = 4096;
      N[(c + 52) >> 2] = d.blocks;
      N[(c + 56) >> 2] = (d.atime.getTime() / 1e3) | 0;
      N[(c + 60) >> 2] = 0;
      N[(c + 64) >> 2] = (d.mtime.getTime() / 1e3) | 0;
      N[(c + 68) >> 2] = 0;
      N[(c + 72) >> 2] = (d.ctime.getTime() / 1e3) | 0;
      N[(c + 76) >> 2] = 0;
      O = [
        d.ino >>> 0,
        ((P = d.ino),
        1 <= +Math.abs(P)
          ? 0 < P
            ? (Math.min(+Math.floor(P / 4294967296), 4294967295) | 0) >>> 0
            : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0
          : 0),
      ];
      N[(c + 80) >> 2] = O[0];
      N[(c + 84) >> 2] = O[1];
      return 0;
    }
    var Wc = void 0;
    function Xc() {
      Wc += 4;
      return N[(Wc - 4) >> 2];
    }
    function Z(a) {
      a = U[a];
      if (!a) throw new R(8);
      return a;
    }
    var Yc;
    Yc = Ba
      ? function () {
          var a = process.hrtime();
          return 1e3 * a[0] + a[1] / 1e6;
        }
      : function () {
          return performance.now();
        };
    var Zc = {};
    function $c() {
      if (!ad) {
        var a = {
            USER: "web_user",
            LOGNAME: "web_user",
            PATH: "/",
            PWD: "/",
            HOME: "/home/web_user",
            LANG:
              (
                ("object" === typeof navigator &&
                  navigator.languages &&
                  navigator.languages[0]) ||
                "C"
              ).replace("-", "_") + ".UTF-8",
            _: xa || "./this.program",
          },
          b;
        for (b in Zc) void 0 === Zc[b] ? delete a[b] : (a[b] = Zc[b]);
        var c = [];
        for (b in a) c.push(b + "=" + a[b]);
        ad = c;
      }
      return ad;
    }
    var ad;
    function Yb(a, b, c, d) {
      a || (a = this);
      this.parent = a;
      this.Wa = a.Wa;
      this.$a = null;
      this.id = Rb++;
      this.name = b;
      this.mode = c;
      this.La = {};
      this.Ma = {};
      this.rdev = d;
    }
    Object.defineProperties(Yb.prototype, {
      read: {
        get: function () {
          return 365 === (this.mode & 365);
        },
        set: function (a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        },
      },
      write: {
        get: function () {
          return 146 === (this.mode & 146);
        },
        set: function (a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        },
      },
    });
    Qc();
    V = Array(4096);
    fc(S, "/");
    X("/tmp");
    X("/home");
    X("/home/web_user");
    (function () {
      X("/dev");
      Fb(259, {
        read: function () {
          return 0;
        },
        write: function (b, c, d, f) {
          return f;
        },
      });
      gc("/dev/null", 259);
      Eb(1280, Hb);
      Eb(1536, Ib);
      gc("/dev/tty", 1280);
      gc("/dev/tty1", 1536);
      var a = Bb();
      Sc("random", a);
      Sc("urandom", a);
      X("/dev/shm");
      X("/dev/shm/tmp");
    })();
    (function () {
      X("/proc");
      var a = X("/proc/self");
      X("/proc/self/fd");
      fc(
        {
          Wa: function () {
            var b = Mb(a, "fd", 16895, 73);
            b.La = {
              lookup: function (c, d) {
                var f = U[+d];
                if (!f) throw new R(8);
                c = {
                  parent: null,
                  Wa: { Ab: "fake" },
                  La: {
                    readlink: function () {
                      return f.path;
                    },
                  },
                };
                return (c.parent = c);
              },
            };
            return b;
          },
        },
        "/proc/self/fd"
      );
    })();
    function na(a, b) {
      var c = Array(ea(a) + 1);
      a = t(a, c, 0, c.length);
      b && (c.length = a);
      return c;
    }
    var cd = {
      a: function (a, b, c, d) {
        J(
          "Assertion failed: " +
            D(a) +
            ", at: " +
            [b ? D(b) : "unknown filename", c, d ? D(d) : "unknown function"]
        );
      },
      p: function (a, b) {
        rb || ((rb = !0), mb());
        a = new Date(1e3 * N[a >> 2]);
        N[b >> 2] = a.getSeconds();
        N[(b + 4) >> 2] = a.getMinutes();
        N[(b + 8) >> 2] = a.getHours();
        N[(b + 12) >> 2] = a.getDate();
        N[(b + 16) >> 2] = a.getMonth();
        N[(b + 20) >> 2] = a.getFullYear() - 1900;
        N[(b + 24) >> 2] = a.getDay();
        var c = new Date(a.getFullYear(), 0, 1);
        N[(b + 28) >> 2] = ((a.getTime() - c.getTime()) / 864e5) | 0;
        N[(b + 36) >> 2] = -(60 * a.getTimezoneOffset());
        var d = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
        c = c.getTimezoneOffset();
        a = (d != c && a.getTimezoneOffset() == Math.min(c, d)) | 0;
        N[(b + 32) >> 2] = a;
        a = N[(qb() + (a ? 4 : 0)) >> 2];
        N[(b + 40) >> 2] = a;
        return b;
      },
      j: function (a, b) {
        try {
          a = D(a);
          if (b & -8) var c = -28;
          else {
            var d = W(a, { Xa: !0 }).node;
            d
              ? ((a = ""),
                b & 4 && (a += "r"),
                b & 2 && (a += "w"),
                b & 1 && (a += "x"),
                (c = a && Xb(d, a) ? -2 : 0))
              : (c = -44);
          }
          return c;
        } catch (f) {
          if ("undefined" === typeof Y || !(f instanceof R)) throw f;
          return -f.Pa;
        }
      },
      u: function (a, b) {
        try {
          return (a = D(a)), ka(a, b), 0;
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return -c.Pa;
        }
      },
      F: function (a) {
        try {
          return (a = D(a)), kc(a), 0;
        } catch (b) {
          if ("undefined" === typeof Y || !(b instanceof R)) throw b;
          return -b.Pa;
        }
      },
      v: function (a, b) {
        try {
          var c = U[a];
          if (!c) throw new R(8);
          ka(c.node, b);
          return 0;
        } catch (d) {
          if ("undefined" === typeof Y || !(d instanceof R)) throw d;
          return -d.Pa;
        }
      },
      G: function (a) {
        try {
          var b = U[a];
          if (!b) throw new R(8);
          kc(b.node);
          return 0;
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return -c.Pa;
        }
      },
      b: function (a, b, c) {
        Wc = c;
        try {
          var d = Z(a);
          switch (b) {
            case 0:
              var f = Xc();
              return 0 > f ? -28 : A(d.path, d.flags, 0, f).fd;
            case 1:
            case 2:
              return 0;
            case 3:
              return d.flags;
            case 4:
              return (f = Xc()), (d.flags |= f), 0;
            case 5:
              return (f = Xc()), (Ma[(f + 0) >> 1] = 2), 0;
            case 6:
            case 7:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              return (N[bd() >> 2] = 28), -1;
            default:
              return -28;
          }
        } catch (h) {
          if ("undefined" === typeof Y || !(h instanceof R)) throw h;
          return -h.Pa;
        }
      },
      B: function (a, b) {
        try {
          var c = Z(a);
          return Vc(ic, c.path, b);
        } catch (d) {
          if ("undefined" === typeof Y || !(d instanceof R)) throw d;
          return -d.Pa;
        }
      },
      x: function (a, b, c, d) {
        try {
          b = D(b);
          var f = d & 256;
          d &= 4096;
          var h = b;
          if ("/" === h[0]) b = h;
          else {
            if (-100 === a) var l = "/";
            else {
              var q = U[a];
              if (!q) throw new R(8);
              l = q.path;
            }
            if (0 == h.length) {
              if (!d) throw new R(44);
              b = l;
            } else b = z(l + "/" + h);
          }
          return Vc(f ? jc : ic, b, c);
        } catch (w) {
          if ("undefined" === typeof Y || !(w instanceof R)) throw w;
          return -w.Pa;
        }
      },
      k: function (a, b) {
        try {
          var c = U[a];
          if (!c) throw new R(8);
          if (0 === (c.flags & 2097155)) throw new R(28);
          lc(c.node, b);
          return 0;
        } catch (d) {
          if ("undefined" === typeof Y || !(d instanceof R)) throw d;
          return -d.Pa;
        }
      },
      i: function (a, b) {
        try {
          if (0 === b) return -28;
          if (b < ea("/") + 1) return -68;
          t("/", y, a, b);
          return a;
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return -c.Pa;
        }
      },
      E: function () {
        return 0;
      },
      z: function (a, b) {
        try {
          return (a = D(a)), Vc(jc, a, b);
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return -c.Pa;
        }
      },
      w: function (a, b) {
        try {
          return (
            (a = D(a)),
            (a = z(a)),
            "/" === a[a.length - 1] && (a = a.substr(0, a.length - 1)),
            X(a, b),
            0
          );
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return -c.Pa;
        }
      },
      t: function (a, b, c, d, f, h) {
        try {
          a: {
            h <<= 12;
            var l = !1;
            if (0 !== (d & 16) && 0 !== a % 65536) var q = -28;
            else {
              if (0 !== (d & 32)) {
                var w = Jb(b);
                if (!w) {
                  q = -48;
                  break a;
                }
                l = !0;
              } else {
                var v = U[f];
                if (!v) {
                  q = -8;
                  break a;
                }
                var C = h;
                if (0 !== (c & 2) && 0 === (d & 2) && 2 !== (v.flags & 2097155))
                  throw new R(2);
                if (1 === (v.flags & 2097155)) throw new R(2);
                if (!v.Ma.gb) throw new R(43);
                var G = v.Ma.gb(v, a, b, C, c, d);
                w = G.Mb;
                l = G.jb;
              }
              Uc[w] = {
                Jb: w,
                Ib: b,
                jb: l,
                fd: f,
                Lb: c,
                flags: d,
                offset: h,
              };
              q = w;
            }
          }
          return q;
        } catch (ia) {
          if ("undefined" === typeof Y || !(ia instanceof R)) throw ia;
          return -ia.Pa;
        }
      },
      s: function (a, b) {
        try {
          var c = Uc[a];
          if (0 !== b && c) {
            if (b === c.Ib) {
              var d = U[c.fd];
              if (d && c.Lb & 2) {
                var f = c.flags,
                  h = c.offset,
                  l = y.slice(a, a + b);
                d && d.Ma.hb && d.Ma.hb(d, l, h, b, f);
              }
              Uc[a] = null;
              c.jb && da(c.Jb);
            }
            var q = 0;
          } else q = -28;
          return q;
        } catch (w) {
          if ("undefined" === typeof Y || !(w instanceof R)) throw w;
          return -w.Pa;
        }
      },
      r: function (a, b, c) {
        Wc = c;
        try {
          var d = D(a),
            f = c ? Xc() : 0;
          return A(d, b, f).fd;
        } catch (h) {
          if ("undefined" === typeof Y || !(h instanceof R)) throw h;
          return -h.Pa;
        }
      },
      H: function (a, b, c) {
        try {
          a = D(a);
          if (0 >= c) var d = -28;
          else {
            var f = Tb(a),
              h = Math.min(c, ea(f)),
              l = n[b + h];
            t(f, y, b, c + 1);
            n[b + h] = l;
            d = h;
          }
          return d;
        } catch (q) {
          if ("undefined" === typeof Y || !(q instanceof R)) throw q;
          return -q.Pa;
        }
      },
      C: function (a) {
        try {
          a = D(a);
          var b = W(a, { parent: !0 }).node,
            c = Ab(a),
            d = Ob(b, c),
            f = bc(b, c, !0);
          if (f) throw new R(f);
          if (!b.La.rmdir) throw new R(63);
          if (d.$a) throw new R(10);
          b.La.rmdir(b, c);
          Wb(d);
          return 0;
        } catch (h) {
          if ("undefined" === typeof Y || !(h instanceof R)) throw h;
          return -h.Pa;
        }
      },
      A: function (a, b) {
        try {
          return (a = D(a)), Vc(ic, a, b);
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return -c.Pa;
        }
      },
      f: function (a) {
        try {
          return (a = D(a)), ua(a), 0;
        } catch (b) {
          if ("undefined" === typeof Y || !(b instanceof R)) throw b;
          return -b.Pa;
        }
      },
      q: function () {
        return 2147483648;
      },
      d: Yc,
      c: function (a) {
        var b = y.length;
        a >>>= 0;
        if (2147483648 < a) return !1;
        for (var c = 1; 4 >= c; c *= 2) {
          var d = b * (1 + 0.2 / c);
          d = Math.min(d, a + 100663296);
          d = Math.max(a, d);
          0 < d % 65536 && (d += 65536 - (d % 65536));
          a: {
            try {
              Pa.grow((Math.min(2147483648, d) - Ya.byteLength + 65535) >>> 16);
              Za();
              var f = 1;
              break a;
            } catch (h) {}
            f = void 0;
          }
          if (f) return !0;
        }
        return !1;
      },
      n: function (a, b) {
        var c = 0;
        $c().forEach(function (d, f) {
          var h = b + c;
          f = N[(a + 4 * f) >> 2] = h;
          for (h = 0; h < d.length; ++h) n[f++ >> 0] = d.charCodeAt(h);
          n[f >> 0] = 0;
          c += d.length + 1;
        });
        return 0;
      },
      o: function (a, b) {
        var c = $c();
        N[a >> 2] = c.length;
        var d = 0;
        c.forEach(function (f) {
          d += f.length + 1;
        });
        N[b >> 2] = d;
        return 0;
      },
      e: function (a) {
        try {
          var b = Z(a);
          ma(b);
          return 0;
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return c.Pa;
        }
      },
      m: function (a, b) {
        try {
          var c = Z(a);
          n[b >> 0] = c.tty
            ? 2
            : T(c.mode)
              ? 3
              : 40960 === (c.mode & 61440)
                ? 7
                : 4;
          return 0;
        } catch (d) {
          if ("undefined" === typeof Y || !(d instanceof R)) throw d;
          return d.Pa;
        }
      },
      g: function (a, b, c, d) {
        try {
          a: {
            for (var f = Z(a), h = (a = 0); h < c; h++) {
              var l = N[(b + (8 * h + 4)) >> 2],
                q = Pc(f, n, N[(b + 8 * h) >> 2], l, void 0);
              if (0 > q) {
                var w = -1;
                break a;
              }
              a += q;
              if (q < l) break;
            }
            w = a;
          }
          N[d >> 2] = w;
          return 0;
        } catch (v) {
          if ("undefined" === typeof Y || !(v instanceof R)) throw v;
          return v.Pa;
        }
      },
      l: function (a, b, c, d, f) {
        try {
          var h = Z(a);
          a = 4294967296 * c + (b >>> 0);
          if (-9007199254740992 >= a || 9007199254740992 <= a) return -61;
          Nc(h, a, d);
          O = [
            h.position >>> 0,
            ((P = h.position),
            1 <= +Math.abs(P)
              ? 0 < P
                ? (Math.min(+Math.floor(P / 4294967296), 4294967295) | 0) >>> 0
                : ~~+Math.ceil((P - +(~~P >>> 0)) / 4294967296) >>> 0
              : 0),
          ];
          N[f >> 2] = O[0];
          N[(f + 4) >> 2] = O[1];
          h.nb && 0 === a && 0 === d && (h.nb = null);
          return 0;
        } catch (l) {
          if ("undefined" === typeof Y || !(l instanceof R)) throw l;
          return l.Pa;
        }
      },
      h: function (a) {
        try {
          var b = Z(a);
          return b.Ma && b.Ma.fsync ? -b.Ma.fsync(b) : 0;
        } catch (c) {
          if ("undefined" === typeof Y || !(c instanceof R)) throw c;
          return c.Pa;
        }
      },
      D: function (a, b, c, d) {
        try {
          a: {
            for (var f = Z(a), h = (a = 0); h < c; h++) {
              var l = la(
                f,
                n,
                N[(b + 8 * h) >> 2],
                N[(b + (8 * h + 4)) >> 2],
                void 0
              );
              if (0 > l) {
                var q = -1;
                break a;
              }
              a += l;
            }
            q = a;
          }
          N[d >> 2] = q;
          return 0;
        } catch (w) {
          if ("undefined" === typeof Y || !(w instanceof R)) throw w;
          return w.Pa;
        }
      },
      I: function (a) {
        var b = Date.now();
        N[a >> 2] = (b / 1e3) | 0;
        N[(a + 4) >> 2] = ((b % 1e3) * 1e3) | 0;
        return 0;
      },
      J: function (a) {
        var b = (Date.now() / 1e3) | 0;
        a && (N[a >> 2] = b);
        return b;
      },
      y: function (a, b) {
        if (b) {
          var c = b + 8;
          b = 1e3 * N[c >> 2];
          b += N[(c + 4) >> 2] / 1e3;
        } else b = Date.now();
        a = D(a);
        try {
          var d = W(a, { Xa: !0 }).node;
          d.La.Ta(d, { timestamp: Math.max(b, b) });
          var f = 0;
        } catch (h) {
          if (!(h instanceof R)) {
            b: {
              f = Error();
              if (!f.stack) {
                try {
                  throw Error();
                } catch (l) {
                  f = l;
                }
                if (!f.stack) {
                  f = "(no stack trace available)";
                  break b;
                }
              }
              f = f.stack.toString();
            }
            e.extraStackTrace && (f += "\n" + e.extraStackTrace());
            f = lb(f);
            throw h + " : " + f;
          }
          f = h.Pa;
          N[bd() >> 2] = f;
          f = -1;
        }
        return f;
      },
    };
    (function () {
      function a(f) {
        e.asm = f.exports;
        Pa = e.asm.K;
        Za();
        L = e.asm.Ca;
        ab.unshift(e.asm.L);
        db--;
        e.monitorRunDependencies && e.monitorRunDependencies(db);
        0 == db &&
          (null !== eb && (clearInterval(eb), (eb = null)),
          fb && ((f = fb), (fb = null), f()));
      }
      function b(f) {
        a(f.instance);
      }
      function c(f) {
        return jb()
          .then(function (h) {
            return WebAssembly.instantiate(h, d);
          })
          .then(function (h) {
            return h;
          })
          .then(f, function (h) {
            Ia("failed to asynchronously prepare wasm: " + h);
            J(h);
          });
      }
      var d = { a: cd };
      db++;
      e.monitorRunDependencies && e.monitorRunDependencies(db);
      if (e.instantiateWasm)
        try {
          return e.instantiateWasm(d, a);
        } catch (f) {
          return (
            Ia("Module.instantiateWasm callback failed with error: " + f), !1
          );
        }
      (function () {
        return La ||
          "function" !== typeof WebAssembly.instantiateStreaming ||
          gb() ||
          Q.startsWith("file://") ||
          "function" !== typeof fetch
          ? c(b)
          : fetch(Q, { credentials: "same-origin" }).then(function (f) {
              return WebAssembly.instantiateStreaming(f, d).then(
                b,
                function (h) {
                  Ia("wasm streaming compile failed: " + h);
                  Ia("falling back to ArrayBuffer instantiation");
                  return c(b);
                }
              );
            });
      })();
      return {};
    })();
    e.___wasm_call_ctors = function () {
      return (e.___wasm_call_ctors = e.asm.L).apply(null, arguments);
    };
    e._sqlite3_free = function () {
      return (e._sqlite3_free = e.asm.M).apply(null, arguments);
    };
    e._sqlite3_value_double = function () {
      return (e._sqlite3_value_double = e.asm.N).apply(null, arguments);
    };
    e._sqlite3_value_text = function () {
      return (e._sqlite3_value_text = e.asm.O).apply(null, arguments);
    };
    var bd = (e.___errno_location = function () {
      return (bd = e.___errno_location = e.asm.P).apply(null, arguments);
    });
    e._sqlite3_prepare_v2 = function () {
      return (e._sqlite3_prepare_v2 = e.asm.Q).apply(null, arguments);
    };
    e._sqlite3_step = function () {
      return (e._sqlite3_step = e.asm.R).apply(null, arguments);
    };
    e._sqlite3_reset = function () {
      return (e._sqlite3_reset = e.asm.S).apply(null, arguments);
    };
    e._sqlite3_exec = function () {
      return (e._sqlite3_exec = e.asm.T).apply(null, arguments);
    };
    e._sqlite3_finalize = function () {
      return (e._sqlite3_finalize = e.asm.U).apply(null, arguments);
    };
    e._sqlite3_column_count = function () {
      return (e._sqlite3_column_count = e.asm.V).apply(null, arguments);
    };
    e._sqlite3_column_name = function () {
      return (e._sqlite3_column_name = e.asm.W).apply(null, arguments);
    };
    e._sqlite3_column_text = function () {
      return (e._sqlite3_column_text = e.asm.X).apply(null, arguments);
    };
    e._sqlite3_column_type = function () {
      return (e._sqlite3_column_type = e.asm.Y).apply(null, arguments);
    };
    e._sqlite3_errmsg = function () {
      return (e._sqlite3_errmsg = e.asm.Z).apply(null, arguments);
    };
    e._sqlite3_value_int = function () {
      return (e._sqlite3_value_int = e.asm._).apply(null, arguments);
    };
    e._sqlite3_clear_bindings = function () {
      return (e._sqlite3_clear_bindings = e.asm.$).apply(null, arguments);
    };
    e._sqlite3_value_blob = function () {
      return (e._sqlite3_value_blob = e.asm.aa).apply(null, arguments);
    };
    e._sqlite3_value_bytes = function () {
      return (e._sqlite3_value_bytes = e.asm.ba).apply(null, arguments);
    };
    e._sqlite3_value_type = function () {
      return (e._sqlite3_value_type = e.asm.ca).apply(null, arguments);
    };
    e._sqlite3_result_blob = function () {
      return (e._sqlite3_result_blob = e.asm.da).apply(null, arguments);
    };
    e._sqlite3_result_double = function () {
      return (e._sqlite3_result_double = e.asm.ea).apply(null, arguments);
    };
    e._sqlite3_result_error = function () {
      return (e._sqlite3_result_error = e.asm.fa).apply(null, arguments);
    };
    e._sqlite3_result_int = function () {
      return (e._sqlite3_result_int = e.asm.ga).apply(null, arguments);
    };
    e._sqlite3_result_int64 = function () {
      return (e._sqlite3_result_int64 = e.asm.ha).apply(null, arguments);
    };
    e._sqlite3_result_null = function () {
      return (e._sqlite3_result_null = e.asm.ia).apply(null, arguments);
    };
    e._sqlite3_result_text = function () {
      return (e._sqlite3_result_text = e.asm.ja).apply(null, arguments);
    };
    e._sqlite3_sql = function () {
      return (e._sqlite3_sql = e.asm.ka).apply(null, arguments);
    };
    e._sqlite3_aggregate_context = function () {
      return (e._sqlite3_aggregate_context = e.asm.la).apply(null, arguments);
    };
    e._sqlite3_data_count = function () {
      return (e._sqlite3_data_count = e.asm.ma).apply(null, arguments);
    };
    e._sqlite3_column_blob = function () {
      return (e._sqlite3_column_blob = e.asm.na).apply(null, arguments);
    };
    e._sqlite3_column_bytes = function () {
      return (e._sqlite3_column_bytes = e.asm.oa).apply(null, arguments);
    };
    e._sqlite3_column_double = function () {
      return (e._sqlite3_column_double = e.asm.pa).apply(null, arguments);
    };
    e._sqlite3_bind_blob = function () {
      return (e._sqlite3_bind_blob = e.asm.qa).apply(null, arguments);
    };
    e._sqlite3_bind_double = function () {
      return (e._sqlite3_bind_double = e.asm.ra).apply(null, arguments);
    };
    e._sqlite3_bind_int = function () {
      return (e._sqlite3_bind_int = e.asm.sa).apply(null, arguments);
    };
    e._sqlite3_bind_text = function () {
      return (e._sqlite3_bind_text = e.asm.ta).apply(null, arguments);
    };
    e._sqlite3_bind_parameter_index = function () {
      return (e._sqlite3_bind_parameter_index = e.asm.ua).apply(
        null,
        arguments
      );
    };
    e._sqlite3_normalized_sql = function () {
      return (e._sqlite3_normalized_sql = e.asm.va).apply(null, arguments);
    };
    e._sqlite3_changes = function () {
      return (e._sqlite3_changes = e.asm.wa).apply(null, arguments);
    };
    e._sqlite3_close_v2 = function () {
      return (e._sqlite3_close_v2 = e.asm.xa).apply(null, arguments);
    };
    e._sqlite3_create_function_v2 = function () {
      return (e._sqlite3_create_function_v2 = e.asm.ya).apply(null, arguments);
    };
    e._sqlite3_open = function () {
      return (e._sqlite3_open = e.asm.za).apply(null, arguments);
    };
    var fa = (e._malloc = function () {
        return (fa = e._malloc = e.asm.Aa).apply(null, arguments);
      }),
      da = (e._free = function () {
        return (da = e._free = e.asm.Ba).apply(null, arguments);
      });
    e._RegisterExtensionFunctions = function () {
      return (e._RegisterExtensionFunctions = e.asm.Da).apply(null, arguments);
    };
    var qb = (e.__get_tzname = function () {
        return (qb = e.__get_tzname = e.asm.Ea).apply(null, arguments);
      }),
      ob = (e.__get_daylight = function () {
        return (ob = e.__get_daylight = e.asm.Fa).apply(null, arguments);
      }),
      nb = (e.__get_timezone = function () {
        return (nb = e.__get_timezone = e.asm.Ga).apply(null, arguments);
      }),
      oa = (e.stackSave = function () {
        return (oa = e.stackSave = e.asm.Ha).apply(null, arguments);
      }),
      qa = (e.stackRestore = function () {
        return (qa = e.stackRestore = e.asm.Ia).apply(null, arguments);
      }),
      B = (e.stackAlloc = function () {
        return (B = e.stackAlloc = e.asm.Ja).apply(null, arguments);
      }),
      Kb = (e._memalign = function () {
        return (Kb = e._memalign = e.asm.Ka).apply(null, arguments);
      });
    e.cwrap = function (a, b, c, d) {
      c = c || [];
      var f = c.every(function (h) {
        return "number" === h;
      });
      return "string" !== b && f && !d
        ? Ra(a)
        : function () {
            return Sa(a, b, c, arguments);
          };
    };
    e.allocate = ba;
    e.UTF8ToString = D;
    e.addFunction = va;
    e.removeFunction = sa;
    e.stackSave = oa;
    e.stackRestore = qa;
    e.stackAlloc = B;
    e.allocateUTF8OnStack = ra;
    e.ALLOC_NORMAL = ca;
    var dd;
    fb = function ed() {
      dd || fd();
      dd || (fb = ed);
    };
    function fd() {
      function a() {
        if (!dd && ((dd = !0), (e.calledRun = !0), !Qa)) {
          e.noFSInit ||
            Rc ||
            ((Rc = !0),
            Qc(),
            (e.stdin = e.stdin),
            (e.stdout = e.stdout),
            (e.stderr = e.stderr),
            e.stdin ? Sc("stdin", e.stdin) : hc("/dev/tty", "/dev/stdin"),
            e.stdout
              ? Sc("stdout", null, e.stdout)
              : hc("/dev/tty", "/dev/stdout"),
            e.stderr
              ? Sc("stderr", null, e.stderr)
              : hc("/dev/tty1", "/dev/stderr"),
            A("/dev/stdin", 0),
            A("/dev/stdout", 1),
            A("/dev/stderr", 1));
          Sb = !1;
          kb(ab);
          if (e.onRuntimeInitialized) e.onRuntimeInitialized();
          if (e.postRun)
            for (
              "function" == typeof e.postRun && (e.postRun = [e.postRun]);
              e.postRun.length;

            ) {
              var b = e.postRun.shift();
              bb.unshift(b);
            }
          kb(bb);
        }
      }
      if (!(0 < db)) {
        if (e.preRun)
          for (
            "function" == typeof e.preRun && (e.preRun = [e.preRun]);
            e.preRun.length;

          )
            cb();
        kb($a);
        0 < db ||
          (e.setStatus
            ? (e.setStatus("Running..."),
              setTimeout(function () {
                setTimeout(function () {
                  e.setStatus("");
                }, 1);
                a();
              }, 1))
            : a());
      }
    }
    e.run = fd;
    if (e.preInit)
      for (
        "function" == typeof e.preInit && (e.preInit = [e.preInit]);
        0 < e.preInit.length;

      )
        e.preInit.pop()();
    fd();

    // The shell-pre.js and emcc-generated code goes above
    return Module;
  }); // The end of the promise being returned

  return initSqlJsPromise;
}; // The end of our initSqlJs function

// This bit below is copied almost exactly from what you get when you use the MODULARIZE=1 flag with emcc
// However, we don't want to use the emcc modularization. See shell-pre.js
if (typeof exports === "object" && typeof module === "object") {
  module.exports = initSqlJs;
  // This will allow the module to be used in ES6 or CommonJS
  module.exports.default = initSqlJs;
} else if (typeof define === "function" && define["amd"]) {
  define([], function () {
    return initSqlJs;
  });
} else if (typeof exports === "object") {
  exports["Module"] = initSqlJs;
}
