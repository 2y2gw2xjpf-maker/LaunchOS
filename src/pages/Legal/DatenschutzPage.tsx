/**
 * Datenschutzerklärung Page - Privacy Policy for German market
 * DSGVO-compliant privacy policy
 */

import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück zu LaunchOS
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

          <div className="prose prose-purple max-w-none space-y-8">
            {/* 1. Datenschutz auf einen Blick */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Datenschutz auf einen Blick
              </h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Allgemeine Hinweise</h3>
              <p className="text-gray-700">
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
                Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
                Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem
                Text aufgeführten Datenschutzerklärung.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Datenerfassung auf dieser Website
              </h3>

              <h4 className="font-medium text-gray-800 mt-4 mb-2">
                Wer ist verantwortlich für die Datenerfassung auf dieser Website?
              </h4>
              <p className="text-gray-700">
                Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in
                dieser Datenschutzerklärung entnehmen.
              </p>

              <h4 className="font-medium text-gray-800 mt-4 mb-2">Wie erfassen wir Ihre Daten?</h4>
              <p className="text-gray-700">
                Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei
                kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben oder bei
                der Registrierung angeben.
              </p>
              <p className="text-gray-700 mt-2">
                Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website
                durch unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z.B.
                Internetbrowser, Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung
                dieser Daten erfolgt automatisch, sobald Sie diese Website betreten.
              </p>

              <h4 className="font-medium text-gray-800 mt-4 mb-2">
                Wofür nutzen wir Ihre Daten?
              </h4>
              <p className="text-gray-700">
                Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet
                werden. Hauptsächlich werden Ihre Daten jedoch für die Bereitstellung unserer
                Dienste verwendet, insbesondere:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Verwaltung Ihres Benutzerkontos</li>
                <li>Bereitstellung der LaunchOS-Plattform</li>
                <li>KI-gestützte Beratung und Dokumentenerstellung</li>
                <li>Investor-CRM und Data Room Funktionen</li>
              </ul>

              <h4 className="font-medium text-gray-800 mt-4 mb-2">
                Welche Rechte haben Sie bezüglich Ihrer Daten?
              </h4>
              <p className="text-gray-700">
                Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
                Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem
                ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
                Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese Einwilligung
                jederzeit für die Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten
                Umständen die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu
                verlangen. Des Weiteren steht Ihnen ein Beschwerderecht bei der zuständigen
                Aufsichtsbehörde zu.
              </p>
              <p className="text-gray-700 mt-2">
                Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an
                uns wenden.
              </p>
            </section>

            {/* 2. Hosting */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Hosting</h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Vercel</h3>
              <p className="text-gray-700">
                Wir hosten unsere Website bei Vercel. Anbieter ist die Vercel Inc., 340 S Lemon Ave
                #4133, Walnut, CA 91789, USA.
              </p>
              <p className="text-gray-700 mt-2">
                Wenn Sie unsere Website besuchen, werden Ihre personenbezogenen Daten auf den
                Servern von Vercel verarbeitet. Hierbei können auch personenbezogene Daten an den
                Mutterkonzern von Vercel in die USA übermittelt werden. Die Datenübertragung in die
                USA wird auf die EU-Standardvertragsklauseln gestützt.
              </p>
              <p className="text-gray-700 mt-2">
                Details entnehmen Sie der Datenschutzerklärung von Vercel:{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  https://vercel.com/legal/privacy-policy
                </a>
              </p>
              <p className="text-gray-700 mt-2">
                Die Verwendung von Vercel erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Wir
                haben ein berechtigtes Interesse an einer möglichst zuverlässigen Darstellung
                unserer Website.
              </p>
            </section>

            {/* 3. Allgemeine Hinweise und Pflichtinformationen */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Allgemeine Hinweise und Pflichtinformationen
              </h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Datenschutz</h3>
              <p className="text-gray-700">
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
                Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
                gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              <p className="text-gray-700 mt-2">
                Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben.
                Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden
                können. Die vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und
                wofür wir sie nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.
              </p>
              <p className="text-gray-700 mt-2">
                Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der
                Kommunikation per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz
                der Daten vor dem Zugriff durch Dritte ist nicht möglich.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Hinweis zur verantwortlichen Stelle
              </h3>
              <p className="text-gray-700">
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-gray-700 mt-2">
                <strong>[Firmenname / Vor- und Nachname]</strong>
                <br />
                [Straße und Hausnummer]
                <br />
                [PLZ] [Ort]
                <br />
                Deutschland
              </p>
              <p className="text-gray-700 mt-2">
                Telefon: [Telefonnummer]
                <br />
                E-Mail: kontakt@launchos.de
              </p>
              <p className="text-gray-700 mt-2">
                Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder
                gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von
                personenbezogenen Daten (z.B. Namen, E-Mail-Adressen o. Ä.) entscheidet.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Speicherdauer</h3>
              <p className="text-gray-700">
                Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
                wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
                Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen
                oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
                sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
                personenbezogenen Daten haben (z.B. steuer- oder handelsrechtliche
                Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung nach Fortfall
                dieser Gründe.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung
              </h3>
              <p className="text-gray-700">
                Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre
                personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9
                Abs. 2 lit. a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO
                verarbeitet werden. Im Falle einer ausdrücklichen Einwilligung in die Übertragung
                personenbezogener Daten in Drittstaaten erfolgt die Datenverarbeitung außerdem auf
                Grundlage von Art. 49 Abs. 1 lit. a DSGVO. Sofern Sie in die Speicherung von Cookies
                oder in den Zugriff auf Informationen in Ihr Endgerät (z.B. via
                Device-Fingerprinting) eingewilligt haben, erfolgt die Datenverarbeitung zusätzlich
                auf Grundlage von § 25 Abs. 1 TTDSG. Die Einwilligung ist jederzeit widerrufbar.
              </p>
              <p className="text-gray-700 mt-2">
                Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung vorvertraglicher
                Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6 Abs. 1
                lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung
                einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1
                lit. c DSGVO. Die Datenverarbeitung kann ferner auf Grundlage unseres berechtigten
                Interesses nach Art. 6 Abs. 1 lit. f DSGVO erfolgen.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Widerruf Ihrer Einwilligung zur Datenverarbeitung
              </h3>
              <p className="text-gray-700">
                Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung
                möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Die
                Rechtmäßigkeit der bis zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf
                unberührt.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen (Art. 21 DSGVO)
              </h3>
              <div className="bg-purple-50 p-4 rounded-lg mt-2">
                <p className="text-gray-700 font-medium text-sm">
                  WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO
                  ERFOLGT, HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN
                  SITUATION ERGEBEN, GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN
                  WIDERSPRUCH EINZULEGEN. DIE JEWEILIGE RECHTSGRUNDLAGE, AUF DENEN EINE VERARBEITUNG
                  BERUHT, ENTNEHMEN SIE DIESER DATENSCHUTZERKLÄRUNG. WENN SIE WIDERSPRUCH EINLEGEN,
                  WERDEN WIR IHRE BETROFFENEN PERSONENBEZOGENEN DATEN NICHT MEHR VERARBEITEN, ES SEI
                  DENN, WIR KÖNNEN ZWINGENDE SCHUTZWÜRDIGE GRÜNDE FÜR DIE VERARBEITUNG NACHWEISEN,
                  DIE IHRE INTERESSEN, RECHTE UND FREIHEITEN ÜBERWIEGEN ODER DIE VERARBEITUNG DIENT
                  DER GELTENDMACHUNG, AUSÜBUNG ODER VERTEIDIGUNG VON RECHTSANSPRÜCHEN (WIDERSPRUCH
                  NACH ART. 21 ABS. 1 DSGVO).
                </p>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Beschwerderecht bei der zuständigen Aufsichtsbehörde
              </h3>
              <p className="text-gray-700">
                Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei
                einer Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen
                Aufenthalts, ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das
                Beschwerderecht besteht unbeschadet anderweitiger verwaltungsrechtlicher oder
                gerichtlicher Rechtsbehelfe.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Recht auf Datenübertragbarkeit
              </h3>
              <p className="text-gray-700">
                Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in
                Erfüllung eines Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in
                einem gängigen, maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die
                direkte Übertragung der Daten an einen anderen Verantwortlichen verlangen, erfolgt
                dies nur, soweit es technisch machbar ist.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Auskunft, Löschung und Berichtigung
              </h3>
              <p className="text-gray-700">
                Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
                unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren
                Herkunft und Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf
                Berichtigung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema
                personenbezogene Daten können Sie sich jederzeit an uns wenden.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Recht auf Einschränkung der Verarbeitung
              </h3>
              <p className="text-gray-700">
                Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen
                Daten zu verlangen. Hierzu können Sie sich jederzeit an uns wenden.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                SSL- bzw. TLS-Verschlüsselung
              </h3>
              <p className="text-gray-700">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung
                vertraulicher Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns
                als Seitenbetreiber senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte
                Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf
                „https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>
              <p className="text-gray-700 mt-2">
                Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an
                uns übermitteln, nicht von Dritten mitgelesen werden.
              </p>
            </section>

            {/* 4. Datenerfassung auf dieser Website */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Datenerfassung auf dieser Website
              </h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Cookies</h3>
              <p className="text-gray-700">
                Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine
                Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden entweder
                vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder dauerhaft
                (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach
                Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem
                Endgerät gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung
                durch Ihren Webbrowser erfolgt.
              </p>
              <p className="text-gray-700 mt-2">
                Wir verwenden hauptsächlich technisch notwendige Cookies für die Authentifizierung
                und Session-Verwaltung. Diese Cookies sind für den Betrieb der Website erforderlich
                und werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gespeichert.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Server-Log-Dateien</h3>
              <p className="text-gray-700">
                Der Provider der Seiten erhebt und speichert automatisch Informationen in so
                genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies
                sind:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              </p>
              <p className="text-gray-700 mt-2">
                Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Der
                Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien
                Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files
                erfasst werden.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Registrierung auf dieser Website
              </h3>
              <p className="text-gray-700">
                Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen auf der
                Seite zu nutzen. Die dazu eingegebenen Daten verwenden wir nur zum Zwecke der
                Nutzung des jeweiligen Angebotes oder Dienstes, für den Sie sich registriert haben.
                Die bei der Registrierung abgefragten Pflichtangaben müssen vollständig angegeben
                werden. Anderenfalls werden wir die Registrierung ablehnen.
              </p>
              <p className="text-gray-700 mt-2">
                Für wichtige Änderungen etwa beim Angebotsumfang oder bei technisch notwendigen
                Änderungen nutzen wir die bei der Registrierung angegebene E-Mail-Adresse, um Sie
                auf diesem Wege zu informieren.
              </p>
              <p className="text-gray-700 mt-2">
                Die Verarbeitung der bei der Registrierung eingegebenen Daten erfolgt zum Zwecke der
                Durchführung des durch die Registrierung begründeten Nutzungsverhältnisses und ggf.
                zur Anbahnung weiterer Verträge (Art. 6 Abs. 1 lit. b DSGVO).
              </p>
              <p className="text-gray-700 mt-2">
                Die bei der Registrierung erfassten Daten werden von uns gespeichert, solange Sie
                auf dieser Website registriert sind und werden anschließend gelöscht. Gesetzliche
                Aufbewahrungsfristen bleiben unberührt.
              </p>
            </section>

            {/* 5. Externe Dienste und APIs */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Externe Dienste und APIs
              </h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Supabase (Datenbank & Authentifizierung)
              </h3>
              <p className="text-gray-700">
                Wir nutzen Supabase für die Datenspeicherung und Benutzer-Authentifizierung.
                Anbieter ist die Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992.
              </p>
              <p className="text-gray-700 mt-2">
                Supabase speichert Ihre Kontodaten (E-Mail, verschlüsseltes Passwort) sowie alle
                Daten, die Sie in der Anwendung erstellen (Ventures, Dokumente, Kontakte, etc.). Die
                Daten werden auf Servern in der EU gespeichert.
              </p>
              <p className="text-gray-700 mt-2">
                Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
              </p>
              <p className="text-gray-700 mt-2">
                Weitere Informationen:{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  https://supabase.com/privacy
                </a>
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Anthropic / Claude API (KI-Dienste)
              </h3>
              <p className="text-gray-700">
                Für die KI-gestützten Funktionen unserer Plattform (Chat, Dokumentenerstellung,
                Analyse) nutzen wir die Claude API von Anthropic. Anbieter ist Anthropic, PBC, 548
                Market St, PMB 90375, San Francisco, CA 94104-5401, USA.
              </p>
              <p className="text-gray-700 mt-2">
                Wenn Sie den Chat oder andere KI-Funktionen nutzen, werden Ihre Eingaben
                (Nachrichten, Kontext) an die Anthropic-Server übermittelt, um eine Antwort zu
                generieren. Anthropic speichert diese Daten gemäß ihrer Datenschutzrichtlinie.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg mt-2">
                <p className="text-gray-700 font-medium text-sm">
                  Hinweis: Bitte geben Sie keine sensiblen personenbezogenen Daten Dritter (z.B.
                  Gesundheitsdaten, Finanzdaten anderer Personen) in den Chat ein.
                </p>
              </div>
              <p className="text-gray-700 mt-2">
                Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
                bzw. Art. 6 Abs. 1 lit. a DSGVO (Einwilligung bei Nutzung der KI-Funktionen).
              </p>
              <p className="text-gray-700 mt-2">
                Weitere Informationen:{' '}
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  https://www.anthropic.com/privacy
                </a>
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Resend (E-Mail-Versand)
              </h3>
              <p className="text-gray-700">
                Für den Versand von System-E-Mails (z.B. Passwort-Zurücksetzung, Benachrichtigungen)
                nutzen wir Resend. Anbieter ist Resend, Inc., USA.
              </p>
              <p className="text-gray-700 mt-2">
                Die Nutzung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
                Interesse an zuverlässigem E-Mail-Versand).
              </p>
              <p className="text-gray-700 mt-2">
                Weitere Informationen:{' '}
                <a
                  href="https://resend.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  https://resend.com/legal/privacy-policy
                </a>
              </p>
            </section>

            {/* 6. Ihre Daten in LaunchOS */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Ihre Daten in LaunchOS
              </h2>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">
                Welche Daten wir speichern
              </h3>
              <p className="text-gray-700">
                Bei der Nutzung von LaunchOS speichern wir folgende Daten:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Kontodaten: E-Mail-Adresse, Name (falls angegeben)</li>
                <li>Venture-Daten: Name, Beschreibung, Branche, Finanzierungsdetails</li>
                <li>Dokumente: Von Ihnen erstellte oder hochgeladene Dateien</li>
                <li>CRM-Daten: Investoren-Kontakte und Aktivitäten</li>
                <li>Chat-Verläufe: Ihre Nachrichten mit dem KI-Assistenten</li>
                <li>Data Room: Hochgeladene Dateien und Zugriffslinks</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Datenlöschung</h3>
              <p className="text-gray-700">
                Sie können Ihr Konto und alle damit verbundenen Daten jederzeit löschen. Gehen Sie
                dazu in die Einstellungen und wählen Sie „Konto löschen". Nach der Löschung werden
                alle Ihre Daten innerhalb von 30 Tagen unwiderruflich entfernt.
              </p>

              <h3 className="text-lg font-medium text-gray-800 mt-6 mb-3">Datenexport</h3>
              <p className="text-gray-700">
                Sie haben das Recht, eine Kopie Ihrer Daten zu erhalten. Kontaktieren Sie uns unter
                der oben angegebenen E-Mail-Adresse, um einen Datenexport anzufordern.
              </p>
            </section>

            {/* 7. Änderungen */}
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Änderungen dieser Datenschutzerklärung
              </h2>
              <p className="text-gray-700">
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
                aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen
                in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue
                Datenschutzerklärung.
              </p>
            </section>
          </div>

          {/* Last Updated */}
          <p className="text-gray-500 text-sm mt-12">Stand: Januar 2026</p>
        </motion.div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-purple-100 bg-white/80 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 LaunchOS</p>
          <div className="flex gap-6">
            <Link to="/datenschutz" className="text-purple-600 text-sm font-medium">
              Datenschutz
            </Link>
            <Link to="/impressum" className="text-gray-500 hover:text-purple-600 text-sm">
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DatenschutzPage;
