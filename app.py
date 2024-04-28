from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('mydb.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS rules
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                 username TEXT,
                 source_ip TEXT,
                 destination_ip TEXT,
                 port INTEGER,
                 protocol TEXT,
                 action TEXT)''')
    conn.commit()
    conn.close()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/add_rule", methods=["POST"])
def add_rule():
    rule = request.form.to_dict()
    conn = sqlite3.connect('mydb.db')
    c = conn.cursor()
    c.execute("INSERT INTO rules (username, source_ip, destination_ip, port, protocol, action) VALUES (?, ?, ?, ?, ?, ?)",
              (rule["username"], rule["source_ip"], rule["destination_ip"], rule["port"], rule["protocol"], rule["action"]))
    rule["id"] = c.lastrowid
    conn.commit()
    conn.close()
    return jsonify(success=True, rule=rule)

@app.route("/get_rules")
def get_rules():
    conn = sqlite3.connect('mydb.db')
    c = conn.cursor()
    c.execute("SELECT * FROM rules")
    rules = [dict(zip(["id", "username", "source_ip", "destination_ip", "port", "protocol", "action"], row)) for row in c.fetchall()]
    conn.close()
    return jsonify(rules)

@app.route("/edit_rule/<int:rule_id>", methods=["PUT"])
def edit_rule(rule_id):
    rule = request.form.to_dict()
    conn = sqlite3.connect('mydb.db')
    c = conn.cursor()
    c.execute("UPDATE rules SET username=?, source_ip=?, destination_ip=?, port=?, protocol=?, action=? WHERE id=?",
              (rule["username"], rule["source_ip"], rule["destination_ip"], rule["port"], rule["protocol"], rule["action"], rule_id))
    conn.commit()
    conn.close()
    return jsonify(success=True)

@app.route("/delete_rule/<int:rule_id>", methods=["DELETE"])
def delete_rule(rule_id):
    conn = sqlite3.connect('mydb.db')
    c = conn.cursor()
    c.execute("DELETE FROM rules WHERE id=?", (rule_id,))
    conn.commit()
    conn.close()
    return jsonify(success=True)

if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0")
