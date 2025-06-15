import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private basePath = '/api'; // Base API URL

  constructor() {}

  /**
   * Streams responses from the Gemini AI endpoint.
   * @param body - The request body containing user input.
   * @returns An Observable that emits streamed responses from the AI.
   */
  public geminiStream(body: any): Observable<string> {
    return new Observable<string>(observer => {
      fetch(`${this.basePath}/gemini`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(response => {
        const reader = response.body?.getReader();
        if (!reader) {
          observer.error("Streaming not supported");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }

            buffer += decoder.decode(value, { stream: true });

            // Process buffer to extract each JSON line
            let lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep the last line for the next chunk

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsedData = JSON.parse(line);
                  if (parsedData.message) {
                    observer.next(parsedData.message);
                  }
                } catch (error) {
                  console.error("JSON parsing error:", error);
                }
              }
            }

            readStream();
          }).catch(error => {
            observer.error(error);
          });
        };

        readStream();
      }).catch(error => {
        observer.error(error);
      });
    });
  }

  /**
   * Streams responses from the Mistral AI endpoint.
   * @param body - The request body containing user input.
   * @returns An Observable that emits streamed responses from the AI.
   */
  public mistralStream(body: any): Observable<string> {
    return new Observable<string>(observer => {
      fetch(`${this.basePath}/mistral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(response => {
        const reader = response.body?.getReader();
        if (!reader) {
          observer.error("Streaming not supported");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        const readStream = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return;
            }

            buffer += decoder.decode(value, { stream: true });

            // Process buffer to extract each JSON line
            let lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep the last line for the next chunk

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const parsedData = JSON.parse(line);
                  if (parsedData.message) {
                    observer.next(parsedData.message);
                  }
                } catch (error) {
                  console.error("JSON parsing error:", error);
                }
              }
            }

            readStream();
          }).catch(error => {
            observer.error(error);
          });
        };

        readStream();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
