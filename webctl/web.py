__author__ = 'Joakim'

from flask import Flask, render_template, jsonify, request
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/process_list")
def get_process_list():
    process_list = app.webctl.get_process_list()
    return jsonify(data=process_list)

@app.route("/hosts")
def get_hosts():
    hosts = app.webctl.hosts.values()
    return jsonify(data=hosts)

@app.route("/start_process", methods=["POST"])
def start_process():
    host_id = request.form['host_id']
    process_name = request.form['process_name']
    resp = app.webctl.get_client_proxy(host_id).startProcess(process_name)
    return jsonify(data=resp)

@app.route("/stop_process", methods=["POST"])
def stop_process():
    host_id = request.form['host_id']
    process_name = request.form['process_name']
    resp = app.webctl.get_client_proxy(host_id).stopProcess(process_name)
    return jsonify(data=resp)

@app.route("/restart_process", methods=["POST"])
def restart_process():
    host_id = request.form['host_id']
    process_name = request.form['process_name']
    start_resp = app.webctl.get_client_proxy(host_id).stopProcess(process_name)
    stop_resp = app.webctl.get_client_proxy(host_id).startProcess(process_name)
    return jsonify(start=start_resp, stop=stop_resp)
