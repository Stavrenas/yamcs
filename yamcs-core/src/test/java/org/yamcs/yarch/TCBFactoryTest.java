package org.yamcs.yarch;

import static org.junit.Assert.*;

import java.io.IOException;

import org.junit.Test;
import org.yamcs.yarch.TCBFactory;
import org.yamcs.yarch.YBDB;


public class TCBFactoryTest {
	private boolean isOpen(YBDB ybdb) {
		try {
			ybdb.sync();
		} catch (IOException e) {
			return false;
		}
		return true;
	}
	
	@Test
	public void testDispose() throws IOException {
		YBDB[] dbs=new YBDB[TCBFactory.maxOpenDbs*2];
		TCBFactory tcbf=new TCBFactory();
		
		for(int i=0;i<TCBFactory.maxOpenDbs;i++) {
			dbs[i]=tcbf.getTcb("/tmp/tcbfactorytest"+i+".tcb", true, false);
		}
		for(int i=0;i<TCBFactory.maxOpenDbs/2;i++) {
		    tcbf.dispose(dbs[i]);
		}
		for(int i=0;i<TCBFactory.maxOpenDbs;i++) {
			assertTrue(isOpen(dbs[i]));
		}
		for(int i=TCBFactory.maxOpenDbs;i<2*TCBFactory.maxOpenDbs;i++) {
			dbs[i]=tcbf.getTcb("/tmp/tcbfactorytest"+i+".tcb", true, false);
		}
		for(int i=0;i<TCBFactory.maxOpenDbs/2;i++) {
			assertFalse(isOpen(dbs[i]));
		}
		for(int i=TCBFactory.maxOpenDbs/2;i<2*TCBFactory.maxOpenDbs;i++) {
			assertTrue(isOpen(dbs[i]));
		}
	}

	
}
