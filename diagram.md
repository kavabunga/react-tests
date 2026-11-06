# Accounts cache

HTTP writes full rows and the server head. The socket writes a patch only when the next revision is `C+1`, and only while no GET is open.

```mermaid
sequenceDiagram
  box Client
    participant UI
    participant Cache
    participant HTTP
    participant Batch
    participant Socket
  end
  participant Server

  UI->>Socket: subscribe
  Socket->>Server: connect
  UI->>Cache: useQuery

  rect rgba(90, 140, 210, 0.13)
    Note over HTTP,Server: 1 · Snapshot
    Cache->>HTTP: queryFn
    HTTP->>Cache: read R
    HTTP->>Server: GET /accounts?revision=R
    Server-->>HTTP: head H, rows after R
    Note over Batch: socket flushes do not write
    HTTP->>Cache: read the map again
    alt map exists
      HTTP->>Cache: replace returned ids, set H
    else first load
      HTTP->>Cache: store the body
    end
    Cache-->>UI: render
  end

  rect rgba(210, 150, 70, 0.13)
    Note over Socket,Batch: 2 · Patches
    Server--)Socket: account.updated
    break bad JSON or Zod
      Socket->>Socket: drop
    end
    Socket->>Batch: enqueue
    alt a GET is open
      Batch--xCache: queue stays, timer stays on
    else C+1, C+2, ...
      Batch->>Cache: patch that run, cursor = last
      Batch->>Batch: drop revisions at or below last
    else starts above C+1
      Batch--xCache: queue keeps them, cursor stays C
      Cache->>HTTP: GET from C
    end
  end
```

| Step | What happens |
| --- | --- |
| Snapshot | `R` is sent only when the cache has one. The server skips `R` and returns full rows changed after it. Stored revision becomes `H`. |
| While a GET is open | The flush does not write. Messages stay in the queue. The timer tries again. |
| `C+1, C+2, ...` | Those accounts are patched. The cursor becomes the last revision in the run. Those messages leave the queue. The timer arms for 1s. |
| Starts above `C+1` | Nothing is patched. The cursor stays `C`. Messages newer than `C` stay. A GET starts from `C`. |
| A hole after a prefix | The prefix is patched and the cursor moves to its last revision. The tail stays in the queue. A GET starts from that cursor. |
| Nothing newer | Revisions at or below `C` leave the queue. The cache is unchanged. The next timer tick finds an empty queue and stops. |
| A missing id | The account is left unchanged. The cursor still moves past that revision, and the message leaves the queue. |
| Throttle | The first flush is immediate. A finished flush arms 1s, even when the queue is empty. A flush that waits arms 1s only when the queue still has messages. Cap is 1000, oldest dropped. |

# Overlap

One GET is already in flight. It captured revision 10. Socket messages wait until it finishes.

```mermaid
sequenceDiagram
  participant Socket
  participant Queue
  participant Cache
  participant HTTP

  Note over Cache,HTTP: GET is open. It captured revision 10.

  Socket->>Queue: rev 11
  Queue--xCache: fetch is open, timer on

  rect rgba(210, 150, 70, 0.16)
    Note over Queue: timer on
    Socket->>Queue: rev 12
    Socket->>Queue: rev 13
    Queue--xCache: timer flush, still fetching
  end

  HTTP->>Cache: head 12, cursor 10 to 12
  Queue->>Cache: timer flush, drop 11 and 12, apply 13
```

| Moment | Cursor | Queue |
| --- | --- | --- |
| 11 arrives | 10 | 11, timer on |
| 12 and 13 arrive | 10 | 11, 12, 13 |
| Timer flush while the GET is open | 10 | 11, 12, 13, timer on |
| Body built at 12 | 12 | 11, 12, 13 |
| Timer flush | 13 | empty, timer armed |

The socket does not write during the GET, so the body cannot move the cursor backward. 11 and 12 are already in that body. 13 is 12 + 1, so the next timer applies it.

# No cache yet

The full list is still in flight. The first socket message arms the timer. Later messages wait. Each timer flush finds the GET still open and arms again.

```mermaid
sequenceDiagram
  participant Socket
  participant Queue
  participant Cache
  participant HTTP

  Note over Cache,HTTP: No cache yet. Full GET is open.

  Socket->>Queue: rev 1
  Queue--xCache: fetch is open, timer on

  rect rgba(210, 150, 70, 0.16)
    Note over Queue: timer on
    Socket->>Queue: rev 2
    Socket->>Queue: rev 3
  end

  HTTP->>Cache: full list, cursor 2
  Queue->>Cache: timer flush, drop 1 and 2, apply 3
```

| Moment | Cursor | Queue |
| --- | --- | --- |
| 1 arrives, then 2 and 3 | none | grows to 1, 2, 3, timer on |
| Full list is stored | 2 | still 1, 2, 3 |
| Timer flush | 3 | empty, timer armed |

The list was built at revision 2, so 1 and 2 are already in it. 3 happened after that. The timer applies it. It does not wait for message 4.

# Missing revision

11 never arrived. The cursor is 10. 12 is not patched. It stays in the queue, and a GET from 10 starts.

```mermaid
sequenceDiagram
  participant Socket
  participant Queue
  participant Cache
  participant HTTP

  Note over Cache: Cursor is 10. Timer is off.

  Socket->>Queue: rev 12, 11 is missing
  Queue--xCache: cursor stays 10
  Cache->>HTTP: GET from 10

  rect rgba(210, 150, 70, 0.16)
    Note over Queue: timer on
    Socket->>Queue: rev 13
    Socket->>Queue: rev 14
    HTTP->>Cache: head 12, cursor 10 to 12
  end
  Queue->>Cache: timer flush, drop 12, apply 13 and 14
```

| Moment | Cursor | Queue |
| --- | --- | --- |
| Flush of 12 | 10 | 12, GET from 10, timer on |
| 13 and 14 arrive | 10 | 12, 13, 14 |
| Body built at 12 | 12 | 12, 13, 14 |
| Timer flush | 14 | empty, timer armed |

The diff includes the missing 11, and the row for 12. 13 is 12 + 1, so the held messages move the cursor to 14. No second GET is requested.

# A hole after a prefix

The cursor is 10. 11 and 12 are applied. 14 waits, because 13 is missing. A GET starts from 12.

```mermaid
sequenceDiagram
  participant Socket
  participant Queue
  participant Cache
  participant HTTP

  Note over Cache: Cursor is 10. Timer is off.

  Socket->>Queue: rev 11
  Queue->>Cache: flush, 10 to 11

  rect rgba(210, 150, 70, 0.16)
    Note over Queue: timer on
    Socket->>Queue: rev 12
    Socket->>Queue: rev 14
  end
  Queue->>Cache: timer flush, apply 12, keep 14
  Cache->>HTTP: GET from 12

  rect rgba(210, 150, 70, 0.16)
    Note over Queue: timer on
    Queue--xCache: timer flush, still fetching
    HTTP->>Cache: head 14, cursor 12 to 14
  end
  Queue->>Cache: timer flush, drop 14
```

| Moment | Cursor | Queue |
| --- | --- | --- |
| Flush of 11 | 11 | empty, timer armed |
| 12 and 14 arrive | 11 | 12, 14 |
| Timer flush | 12 | 14, GET from 12, timer on |
| Timer flush while the GET is open | 12 | 14 |
| Body built at 14 | 14 | 14 |
| Timer flush | 14 | empty, timer armed |

12 follows 11, so it is patched. 14 does not follow 12, so it stays. The body includes the missing 13 and the row for 14. The next timer drops 14, because the cursor is already there.
